import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { createComfyImageRuntime } from './comfy-image.js';
import { generateCloudImage } from './image-providers.js';

const PROVIDERS = ['comfy', 'z-image', 'cogview', 'pollinations'];
const KEYS = { cogview: 'FPS_COGVIEW_API_KEY', pollinations: 'FPS_POLLINATIONS_API_KEY' };
const ASPECTS = ['1:1', '16:9', '9:16', '4:3', '3:4'];
const EXTENSIONS = new Set(['png', 'jpg', 'webp']);
const HEADERS = { 'cache-control': 'no-store' };
const TOOL_NAME = 'fps_generate_image';
const requestError = (code, status = 400) => Object.assign(new Error(code), { code, status });

async function writeSettings(directory, filename, enabled) {
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const temporary = join(directory, `${randomUUID()}.tmp`);
  try {
    await writeFile(temporary, JSON.stringify({ enabled }), { flag: 'wx', mode: 0o600 });
    await rename(temporary, filename);
  } finally {
    await rm(temporary, { force: true }).catch(() => {});
  }
}

function toolDefinition(available, execute) {
  return {
    name: TOOL_NAME,
    description: 'Generate one new image when the user asks for image generation. Prefer the user’s configured '
      + 'image generation tools unless they request FPS or an FPS provider by name. Omit provider for FPS’s default; '
      + 'choose one explicitly only when requested. Do not send unrelated conversation content. This tool does not '
      + 'edit or analyze existing images. Show the saved image with a Markdown image link using the returned path.',
    parameters: {
      type: 'object', additionalProperties: false, required: ['prompt'],
      properties: {
        prompt: { type: 'string', description: 'Text describing the requested image.' },
        aspectRatio: { type: 'string', enum: ASPECTS, description: 'Image proportions. Defaults to 1:1.' },
        provider: { type: 'string', enum: available, description: 'Optional FPS provider requested by the user.' },
      },
    },
    output: {
      schema: {
        type: 'object', additionalProperties: false, required: ['path', 'provider'],
        properties: { path: { type: 'string' }, provider: { type: 'string' } },
      },
      render: (_args, value) => [{ type: 'text', text: `Saved image to: ${value.path} (provider=${value.provider})` }],
    },
    timeoutMs: available.includes('comfy') ? 21 * 60_000 : 155_000,
    execute,
  };
}

export async function registerImageGeneration(ctx, {
  home = resolve(process.env.DSH_HOME || join(homedir(), '.dsh')),
  createComfy = createComfyImageRuntime,
  generateCloud = generateCloudImage,
} = {}) {
  const directory = join(home, 'plugins', 'fps-image-generation');
  const filename = join(directory, 'settings.json');
  let enabled = {};
  try {
    const saved = JSON.parse(await readFile(filename, 'utf8'));
    enabled = Object.fromEntries(PROVIDERS.map((provider) => [provider, saved.enabled?.[provider] === true]));
  } catch (error) {
    if (error?.code !== 'ENOENT') ctx.logger.warn('FPS image settings could not be read. Image providers remain off.');
  }

  const comfy = createComfy({ directory: join(directory, 'comfy') });
  const jobs = new Map();
  let closed = false;
  let toolsContext;
  let removeTool;
  let toolProviders = '';
  let queue = Promise.resolve();
  let installation;

  function serial(task) {
    const next = queue.then(() => {
      if (closed) throw requestError('unavailable', 503);
      return task();
    });
    queue = next.catch(() => {});
    return next;
  }

  function environment(key) {
    return ctx.get('launchEnvironment')?.get(key)?.value ?? process.env[key];
  }

  async function keyFor(provider) {
    if (!Object.hasOwn(KEYS, provider)) return {};
    const ref = KEYS[provider];
    const credentials = ctx.get('credentials');
    const credential = await credentials?.resolve?.(ref);
    const value = credential?.value?.trim() || environment(provider === 'pollinations' ? 'POLLINATIONS_API_KEY' : ref)?.trim();
    return { value, stored: credential?.source === 'file', writable: typeof credentials?.set === 'function' };
  }

  async function snapshot() {
    const [comfyStatus, ...keys] = await Promise.all([
      enabled.comfy ? comfy.status() : { state: 'off' }, ...PROVIDERS.slice(1).map(keyFor),
    ]);
    return {
      supported: !!toolsContext,
      providers: Object.fromEntries(PROVIDERS.map((provider, index) => {
        const key = keys[index - 1];
        return [provider, { enabled: enabled[provider] === true,
          ...(Object.hasOwn(KEYS, provider) ? { configured: !!key.value, stored: key.stored, writable: key.writable } : {}),
          ...(provider === 'comfy' ? { setup: comfyStatus } : {}) }];
      })),
    };
  }

  function availableFrom({ providers }) {
    return PROVIDERS.filter((provider) => {
      const entry = providers[provider];
      return entry.enabled && (provider === 'comfy' ? entry.setup.state === 'ready' : entry.configured !== false);
    });
  }

  function syncTool(state) {
    if (closed) return;
    const available = state.supported ? availableFrom(state) : [];
    const signature = available.join(',');
    if (signature === toolProviders) return;
    removeTool?.();
    removeTool = undefined;
    toolProviders = '';
    if (available.length) {
      try {
        removeTool = toolsContext.tools.register(toolDefinition(available, generate));
        toolProviders = signature;
      } catch (error) {
        ctx.logger.warn('FPS image tool registration failed: %s', error?.message);
        throw error;
      }
    }
  }

  async function generate(args, exec) {
    if (closed || !exec.agent) throw new Error('FPS image generation requires an active DSH conversation.');
    const prompt = typeof args?.prompt === 'string' ? args.prompt.trim() : '';
    const aspectRatio = args?.aspectRatio ?? '1:1';
    if (!prompt || prompt.length > 4000 || !ASPECTS.includes(aspectRatio)) {
      throw new Error('Provide an image prompt of up to 4,000 characters and a supported aspect ratio.');
    }
    const available = availableFrom(await snapshot());
    const provider = args.provider ?? available[0];
    if (!available.includes(provider)) throw new Error('This FPS image provider is off or needs setup in the plugin details.');
    if (jobs.has(provider)) throw new Error('This FPS image provider is already generating an image.');
    const job = new AbortController();
    jobs.set(provider, job);
    const signal = AbortSignal.any([job.signal, exec.signal, AbortSignal.timeout(provider === 'comfy' ? 20 * 60_000 : 145_000)]);
    try {
      const apiKey = (await keyFor(provider)).value;
      if (Object.hasOwn(KEYS, provider) && !apiKey) throw new Error('Set an API key for this image provider in the FPS plugin details.');
      signal.throwIfAborted();
      const image = await (provider === 'comfy' ? comfy.generate({ prompt, aspectRatio, signal })
        : generateCloud(provider, { prompt, aspectRatio, apiKey, signal }));
      signal.throwIfAborted();
      if (!EXTENSIONS.has(image?.extension) || !(image.bytes instanceof Uint8Array) || !image.bytes.length) {
        throw new Error('The image provider did not return a valid image.');
      }
      const outputDir = join(home, 'generated');
      await mkdir(outputDir, { recursive: true, mode: 0o700 });
      signal.throwIfAborted();
      const path = join(outputDir, `fps-image-${randomUUID()}.${image.extension}`);
      // The filename and destination are FPS-controlled, never model parameters.
      try {
        await writeFile(path, image.bytes, { flag: 'wx', mode: 0o600, signal });
        signal.throwIfAborted();
      } catch (error) {
        if (error?.code !== 'EEXIST') await rm(path, { force: true }).catch(() => {});
        throw error;
      }
      return { path, provider };
    } finally {
      jobs.delete(provider);
    }
  }

  async function mutate(input) {
    const { action, provider } = input ?? {};
    if (action === 'toggle' && PROVIDERS.includes(provider) && typeof input.enabled === 'boolean') {
      const next = { ...enabled, [provider]: input.enabled };
      await writeSettings(directory, filename, next);
      enabled = next;
      if (!input.enabled) {
        jobs.get(provider)?.abort(new Error('The image provider was turned off.'));
        if (provider === 'comfy') await comfy.cancelInstall();
      }
    } else if (action === 'saveKey' && Object.hasOwn(KEYS, provider)) {
      const credentials = ctx.get('credentials');
      const key = typeof input.key === 'string' ? input.key.trim() : null;
      if (key === null || key.length > 2048 || /\s/u.test(key)) throw requestError('invalidKey');
      if (key ? !credentials?.set : !credentials?.unset) throw requestError('keyStoreUnavailable', 503);
      try {
        if (key) await credentials.set(KEYS[provider], key);
        else await credentials.unset(KEYS[provider]);
      } catch {
        throw requestError('keyStoreUnavailable', 503);
      }
    } else if (action === 'installComfy' && enabled.comfy && !installation) {
      const { state } = await comfy.status();
      if (state !== 'missing' && state !== 'error') throw requestError('setupUnavailable');
      installation = Promise.resolve(comfy.install()).catch(() => {}).finally(() => {
        installation = undefined;
        void serial(async () => syncTool(await snapshot())).catch(() => {});
      });
    } else if (action === 'cancelComfy' && enabled.comfy) {
      await comfy.cancelInstall();
    } else {
      throw requestError('invalidAction');
    }
  }

  ctx.effect(() => () => {
    closed = true;
    removeTool?.();
    for (const job of jobs.values()) job.abort(new Error('FPS was unloaded.'));
    void Promise.resolve(comfy.dispose()).catch(() => {});
  }, 'fps: image generation');

  ctx.connection.fetch.register({
    path: '/api/workbench/imageSettings', methods: ['GET', 'POST'], requestBody: 'buffered',
    async fetch(request) {
      try {
        const post = request.method === 'POST';
        let input;
        if (post) {
          if (request.headers.get('content-type') !== 'application/json') throw requestError('invalidAction', 415);
          const body = await request.text();
          if (body.length > 4096) throw requestError('invalidAction', 413);
          try { input = JSON.parse(body); } catch { throw requestError('invalidAction'); }
        }
        return await serial(async () => {
          if (post) {
            if (!toolsContext) throw requestError('unavailable', 503);
            await mutate(input);
          }
          const state = await snapshot();
          syncTool(state);
          return Response.json(state, { headers: HEADERS });
        });
      } catch (error) {
        return Response.json({ error: error.status ? error.code : 'unavailable' },
          { status: error.status ?? 500, headers: HEADERS });
      }
    },
  });
  let startup;
  ctx.inject(['tools'], (scope) => {
    toolsContext = scope;
    scope.effect(() => () => {
      if (toolsContext !== scope) return;
      toolsContext = undefined;
      removeTool?.();
      removeTool = undefined;
      toolProviders = '';
    }, 'fps: scoped image tools');
    if (PROVIDERS.some((provider) => enabled[provider])) {
      startup = serial(async () => syncTool(await snapshot())).catch(() => {
        ctx.logger.warn('FPS image tools could not be loaded. Open plugin settings to check the image providers.');
      });
    }
  });
  await startup;
}
