import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const KIMI_CODE_ORIGINS = new Set(['https://api.kimi.com', 'https://api.kimi.ai']);
const KIMI_WINDOWS = [
  ['limit_5h', 'fiveHours'],
  ['limit_7d', 'sevenDays'],
  ['limit_month_total', 'monthTotal'],
];
const USER_AGENT = 'DeepSeek-Harness-Claude-Workbench';
const DREAMINA_CREDIT_CYCLE_MS = 30 * 24 * 60 * 60 * 1000;
const execFileAsync = promisify(execFile);

function number(value) {
  if (typeof value !== 'number' && !(typeof value === 'string' && value.trim())) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function money(currency, amount) {
  return typeof currency === 'string' && /^[A-Z]{3}$/u.test(currency) && amount !== null
    ? { currency, amount } : null;
}

function resetTimestamp(value) {
  const timestamp = number(value);
  return timestamp > 0 && Number.isFinite(new Date(timestamp).getTime()) ? timestamp : null;
}

function deepSeekUsage(payload) {
  const balances = Array.isArray(payload?.balance_infos)
    ? payload.balance_infos.map((entry) => money(entry?.currency, number(entry?.total_balance))).filter(Boolean)
    : [];
  return balances.length ? { balances } : null;
}

function kimiCodeUsage(payload) {
  const windows = [];
  for (const [field, id] of KIMI_WINDOWS) {
    const entry = payload?.usages?.[field];
    const ratio = number(entry?.used_ratio);
    if (ratio === null || ratio < 0) continue;
    const resetAt = typeof entry.reset_time === 'string' ? Date.parse(entry.reset_time) : NaN;
    windows.push({ id, ratio, ...(Number.isFinite(resetAt) ? { resetAt } : {}) });
  }

  const wallet = payload?.booster_wallet ?? payload?.boosterWallet;
  const currency = wallet?.monthlyChargeLimit?.currency ?? wallet?.monthlyUsed?.currency ?? wallet?.topupLimit?.currency;
  const rawBalance = number(wallet?.balance?.amountLeft);
  // Kimi's wallet uses one million fixed-point units per cent.
  const balance = wallet?.balance?.type === 'BOOSTER' && rawBalance !== null
    ? money(currency, (rawBalance > 0 && rawBalance < 1_000_000 ? 1 : Math.round(rawBalance / 1_000_000)) / 100)
    : null;
  return windows.length || balance ? { windows, balance } : null;
}

function kimiApiUsage(payload) {
  if (payload?.code !== 0 || payload?.status !== true) return null;
  const balance = money('CNY', number(payload.data?.available_balance));
  return balance ? { balances: [balance] } : null;
}

function miniMaxUsage(payload) {
  if (payload?.base_resp?.status_code !== 0 || !Array.isArray(payload?.model_remains)) return null;
  const quota = payload.model_remains.find((row) => row?.model_name === 'general');
  if (!quota) return null;

  const windows = [];
  for (const [id, percentField, resetField] of [
    ['fiveHours', 'current_interval_remaining_percent', 'end_time'],
    ['sevenDays', 'current_weekly_remaining_percent', 'weekly_end_time'],
  ]) {
    const remaining = number(quota[percentField]);
    if (remaining === null || remaining < 0 || remaining > 100) continue;
    const resetAt = resetTimestamp(quota[resetField]);
    windows.push({ id, ratio: (100 - remaining) / 100, ...(resetAt ? { resetAt } : {}) });
  }
  return windows.length ? { windows } : null;
}

function zhipuUsage(payload) {
  const data = payload?.data;
  if (payload?.success !== true || !Array.isArray(data?.limits)) return null;

  const windows = [];
  // GLM reports the 5-hour and weekly windows as units 3 and 6 respectively.
  for (const [unit, id] of [[3, 'fiveHours'], [6, 'sevenDays']]) {
    const entry = data.limits.find((row) => number(row?.unit) === unit
      && (row.type === 'CREDIT_LIMIT' || row.type === 'TOKENS_LIMIT'));
    const percentage = number(entry?.percentage);
    if (percentage === null || percentage < 0) continue;

    const window = { id, ratio: percentage / 100 };
    const resetAt = resetTimestamp(entry.nextResetTime);
    if (resetAt) window.resetAt = resetAt;
    const remaining = number(entry.remaining);
    const total = number(entry.usage);
    if (entry.type === 'CREDIT_LIMIT' && remaining !== null && remaining >= 0 && total > 0) {
      window.credits = { remaining, total };
    }
    windows.push(window);
  }

  const plans = { lite: 'Lite', pro: 'Pro', max: 'Max' };
  const level = typeof data.level === 'string' ? data.level.toLowerCase() : '';
  const plan = Object.hasOwn(plans, level) ? plans[level] : undefined;
  return windows.length ? { windows, plan } : null;
}

function openRouterUsage(payload) {
  const data = payload?.data;
  const charges = [
    ['spent', number(data?.usage)],
    ['keyRemaining', number(data?.limit_remaining)],
  ].flatMap(([id, amount]) => amount !== null && amount >= 0 ? [{ id, currency: 'USD', amount }] : []);
  return charges.length ? { charges } : null;
}

function adapterFor(baseURL) {
  if (typeof baseURL !== 'string') return null;
  let url;
  try { url = new URL(baseURL); } catch { return null; }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) return null;
  const { origin, pathname } = url;
  if (KIMI_CODE_ORIGINS.has(origin) && /^\/coding(?:\/|$)/u.test(pathname)) {
    return { name: 'Kimi Coding', url: `${origin}/coding/v1/usages`, parse: kimiCodeUsage };
  }
  switch (origin) {
    case 'https://api.deepseek.com':
      return { name: 'DeepSeek', url: `${origin}/user/balance`, parse: deepSeekUsage };
    case 'https://api.moonshot.cn':
      return { name: 'Kimi API', url: `${origin}/v1/users/me/balance`, parse: kimiApiUsage };
    case 'https://open.bigmodel.cn':
    case 'https://api.z.ai':
      return { name: 'GLM Coding Plan', url: `${origin}/api/monitor/usage/quota/limit`, parse: zhipuUsage, rawAuthorization: true };
    case 'https://api.minimaxi.com':
    case 'https://api.minimax.cn':
      return { name: 'MiniMax', url: 'https://www.minimaxi.com/v1/token_plan/remains', parse: miniMaxUsage };
    case 'https://api.minimax.io':
      return { name: 'MiniMax', url: 'https://www.minimax.io/v1/token_plan/remains', parse: miniMaxUsage };
    case 'https://openrouter.ai':
      return { name: 'OpenRouter', url: `${origin}/api/v1/key`, parse: openRouterUsage };
    default:
      return null;
  }
}

function configuredTargets(ctx) {
  const active = new Set(ctx.llm.listProviders().map(({ id }) => id));
  const settings = ctx.get('settings')?.describe({ redactSecrets: true }) ?? [];
  const byNamespace = new Map(settings.map(({ ns, value }) => [ns, value]));
  const targets = [];
  for (const entry of ctx.llm.listConfigurableProviders?.() ?? []) {
    if (!active.has(entry.provider)) continue;
    const profile = entry.settingsPath.reduce((value, key) =>
      value && Object.hasOwn(value, key) ? value[key] : undefined, byNamespace.get(entry.settingsNs));
    if (!profile || typeof profile !== 'object') continue;
    const adapter = adapterFor(profile.baseURL ?? entry.defaultBaseURL);
    if (!adapter) continue;
    const native = adapterFor(entry.defaultBaseURL);
    targets.push({
      id: entry.provider, adapter, ref: profile.apiKeyEnv,
      // The catalog's native credentials belong to its official account and region.
      ...(native?.url === adapter.url ? { nativeRefs: entry.nativeAuth?.env ?? [], nativeId: entry.provider } : {}),
    });
  }

  const installedDeepSeek = ctx.get('configEditor')?.entries().find(({ options }) =>
    options.name === '@deepseek-ai/dsh-llm-deepseek-api-key');
  const official = byNamespace.get(installedDeepSeek?.options.id ?? 'llm-deepseek');
  if (active.has('deepseek-official') && official) {
    const envBase = ctx.get('launchEnvironment')?.get('DEEPSEEK_BASE_URL')?.value ?? process.env.DEEPSEEK_BASE_URL;
    const adapter = adapterFor(official.baseURL ?? envBase ?? 'https://api.deepseek.com');
    if (adapter?.parse === deepSeekUsage) {
      targets.push({ id: 'deepseek-official', adapter, ref: official.apiKeyEnv ?? 'DEEPSEEK_API_KEY' });
    }
  }
  return targets;
}

async function resolveKey(credentials, target) {
  const readRef = async (ref) => {
    if (typeof ref !== 'string' || !/^[A-Za-z_][A-Za-z0-9_]*$/u.test(ref)) return null;
    return (await credentials?.resolve?.(ref))?.value?.trim() || null;
  };
  if (target.ref !== undefined) return readRef(target.ref);
  if (target.nativeId && /^[a-z][a-z0-9-]*$/u.test(target.nativeId)) {
    const record = await credentials?.readRecord?.(`llm-pi-ai/${target.nativeId}`);
    if (record) return record.kind === 'api-key' ? record.key?.trim() || null : null;
  }
  for (const ref of target.nativeRefs ?? []) {
    const key = await readRef(ref);
    if (key) return key;
  }
  return null;
}

async function kimiCodeFromCCSwitch() {
  // This optional source is restricted to the named Kimi Coding entry and official origin.
  let db;
  try {
    const { DatabaseSync } = await import('node:sqlite');
    db = new DatabaseSync(join(homedir(), '.cc-switch', 'cc-switch.db'), { readOnly: true });
    const row = db.prepare("SELECT settings_config FROM providers WHERE app_type = ? AND id = ?")
      .get('opencode', 'kimi-coding');
    const options = row ? JSON.parse(row.settings_config)?.options : null;
    if (typeof options?.baseURL !== 'string' || typeof options.apiKey !== 'string' || !options.apiKey.trim()) return null;
    const base = new URL(options.baseURL);
    if (!KIMI_CODE_ORIGINS.has(base.origin) || !/^\/coding(?:\/v1)?\/?$/u.test(base.pathname)
        || base.username || base.password || base.search || base.hash) return null;
    return { id: 'cc-switch-kimi-code', key: options.apiKey.trim(), adapter: adapterFor(base.href) };
  } catch {
    return null;
  } finally {
    db?.close();
  }
}

async function queryUsage({ id, adapter, key }, signal, request) {
  try {
    const response = await request(adapter.url, {
      headers: {
        Authorization: adapter.rawAuthorization ? key : `Bearer ${key}`,
        Accept: 'application/json',
        'User-Agent': USER_AGENT,
      },
      redirect: 'error',
      signal: AbortSignal.any([signal, AbortSignal.timeout(8_000)]),
    });
    if (!response.ok) return null;
    const usage = adapter.parse(await response.json());
    return usage ? { id, name: adapter.name, ...usage } : null;
  } catch {
    return null;
  }
}

async function readLocalSettings() {
  try {
    const directory = process.env.DSH_HOME || join(homedir(), '.dsh');
    return JSON.parse(await readFile(join(directory, 'workbench-usage.json'), 'utf8'));
  } catch {
    return null;
  }
}

function dreaminaCreditReset(subscription, userId) {
  if (!Number.isSafeInteger(userId) || userId !== subscription.userId) return null;
  const openedAt = Date.parse(subscription.openedAt);
  const expiresAt = Date.parse(subscription.expiresAt);
  const now = Date.now();
  if (!(openedAt <= now && now < expiresAt)) return null;
  const nextCycle = Math.floor((now - openedAt) / DREAMINA_CREDIT_CYCLE_MS) + 1;
  const resetAt = openedAt + nextCycle * DREAMINA_CREDIT_CYCLE_MS;
  return resetAt < expiresAt ? resetAt : null;
}

async function dreaminaUsage(subscription, signal) {
  if (!subscription || subscription.enabled === false) return null;
  const executable = process.env.DREAMINA_BIN || join(homedir(), '.local', 'bin', 'dreamina');
  try {
    const { stdout } = await execFileAsync(executable, ['user_credit'], {
      signal, timeout: 8_000, maxBuffer: 64 * 1024,
    });
    const account = JSON.parse(stdout);
    const credits = number(account?.total_credit);
    if (credits === null || credits < 0) return null;
    const resetAt = dreaminaCreditReset(subscription, account.user_id);
    return { id: 'dreamina', name: 'Dreamina', credits, ...(resetAt ? { resetAt } : {}) };
  } catch {
    return null;
  }
}

export async function providerUsage(ctx, signal, { request = fetch, localSettings = readLocalSettings } = {}) {
  const credentials = ctx.get('credentials');
  const local = await localSettings();
  const resolved = await Promise.allSettled(configuredTargets(ctx).map(async (target) => ({
    ...target, key: await resolveKey(credentials, target),
  })));
  const candidates = resolved.flatMap((result) => result.status === 'fulfilled' && result.value.key ? [result.value] : []);
  if (local?.kimiCode?.source === 'cc-switch') {
    const kimiCode = await kimiCodeFromCCSwitch();
    if (kimiCode) candidates.push(kimiCode);
  }

  const seen = new Map();
  const jobs = candidates.flatMap((target) => {
    const url = target.adapter.url;
    const keys = seen.get(url) ?? new Set();
    if (keys.has(target.key)) return [];
    keys.add(target.key);
    seen.set(url, keys);
    return [queryUsage(target, signal, request)];
  });
  const sections = (await Promise.all([...jobs, dreaminaUsage(local?.dreamina, signal)])).filter(Boolean);
  return sections;
}
