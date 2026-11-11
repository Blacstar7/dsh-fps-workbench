import assert from 'node:assert/strict';
import test from 'node:test';
import { providerUsage } from '../provider-usage.js';

function host(profiles, { refs = {}, records = {}, defaults = {}, inactive = [] } = {}) {
  const llm = {
    listProviders: () => Object.keys(profiles).filter((id) => !inactive.includes(id)).map((id) => ({ id })),
    listConfigurableProviders: () => Object.keys(profiles).map((provider) => ({
      provider, settingsNs: 'custom-models', settingsPath: ['providers', provider], ...defaults[provider],
    })),
  };
  const services = {
    credentials: {
      resolve: async (ref) => refs[ref] && { value: refs[ref] },
      readRecord: async (id) => records[id],
    },
    settings: {
      describe: () => [{ ns: 'custom-models', value: { providers: profiles } }],
    },
  };
  return { llm, get: (name) => services[name] };
}

test('usage follows active DSH routes, deduplicates keys, and omits unreadable sections', async () => {
  const deepseek = { baseURL: 'https://api.deepseek.com/v1', apiKeyEnv: 'CUSTOM_BALANCE_KEY' };
  const ctx = host({
    'my-deepseek': deepseek,
    'second-route': deepseek,
    'inactive-route': { ...deepseek, apiKeyEnv: 'INACTIVE_KEY' },
    'untrusted-proxy': { ...deepseek, baseURL: 'https://api.deepseek.com.other.test/v1' },
    'custom-glm': { baseURL: 'https://open.bigmodel.cn/api/coding/paas/v4', apiKeyEnv: 'GLM_PLAN_KEY' },
    'custom-kimi': { baseURL: 'https://api.moonshot.cn/v1', apiKeyEnv: 'MOONSHOT_KEY' },
    'missing-key': { ...deepseek, apiKeyEnv: 'MISSING_KEY' },
  }, {
    refs: { CUSTOM_BALANCE_KEY: 'test-deepseek', INACTIVE_KEY: 'inactive', GLM_PLAN_KEY: 'test-glm', MOONSHOT_KEY: 'test-kimi' },
    inactive: ['inactive-route'],
  });
  const calls = [];
  const request = async (url, options) => {
    calls.push([url, options.headers.Authorization, options.redirect]);
    if (url.includes('deepseek')) return Response.json({ balance_infos: [{ currency: 'CNY', total_balance: '0' }] });
    if (url.includes('bigmodel')) return new Response('', { status: 403 });
    return Response.json({ code: 0, status: true, data: {} });
  };
  const result = await providerUsage(ctx, new AbortController().signal, { request, localSettings: async () => null });
  assert.deepEqual(calls, [
    ['https://api.deepseek.com/user/balance', 'Bearer test-deepseek', 'error'],
    ['https://open.bigmodel.cn/api/monitor/usage/quota/limit', 'test-glm', 'error'],
    ['https://api.moonshot.cn/v1/users/me/balance', 'Bearer test-kimi', 'error'],
  ]);
  assert.deepEqual(result, [{ id: 'my-deepseek', name: 'DeepSeek', balances: [{ currency: 'CNY', amount: 0 }] }]);
});

test('native API key records work without machine-specific credential names', async () => {
  const ctx = host({ openrouter: {}, 'kimi-coding': {}, minimax: {} }, {
    defaults: {
      openrouter: { defaultBaseURL: 'https://openrouter.ai/api/v1' },
      'kimi-coding': { defaultBaseURL: 'https://api.kimi.com/coding/v1', nativeAuth: { env: ['KIMI_API_KEY'] } },
      minimax: { defaultBaseURL: 'https://api.minimax.io/anthropic', nativeAuth: { env: ['MINIMAX_API_KEY'] } },
    },
    records: {
      'llm-pi-ai/openrouter': { kind: 'api-key', key: 'test-router' },
      'llm-pi-ai/minimax': { kind: 'oauth', payload: { access: 'not-an-api-key' } },
    },
    refs: { KIMI_API_KEY: 'test-kimi', MINIMAX_API_KEY: 'not-the-active-credential' },
  });
  const request = async (url, options) => {
    if (url === 'https://openrouter.ai/api/v1/key') {
      assert.equal(options.headers.Authorization, 'Bearer test-router');
      return Response.json({ data: { usage: 2.5, limit_remaining: null, label: 'discarded' } });
    }
    assert.equal(url, 'https://api.kimi.com/coding/v1/usages');
    assert.equal(options.headers.Authorization, 'Bearer test-kimi');
    return Response.json({ usages: { limit_5h: { used_ratio: 0.25 }, limit_7d: {} } });
  };
  assert.deepEqual(await providerUsage(ctx, new AbortController().signal, { request, localSettings: async () => null }), [
    { id: 'openrouter', name: 'OpenRouter', charges: [{ id: 'spent', currency: 'USD', amount: 2.5 }] },
    { id: 'kimi-coding', name: 'Kimi Coding', windows: [{ id: 'fiveHours', ratio: 0.25 }], balance: null },
  ]);
});
