import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import test from 'node:test';
import { registerImageGeneration } from '../image-generation.js';

const IMAGE = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jCoUAAAAASUVORK5CYII=',
  'base64',
);
const API_KEY = 'fake-fps-test-key';
const EXECUTION = { agent: {}, signal: new AbortController().signal };

async function testHome(t) {
  const home = await mkdtemp(join(tmpdir(), 'fps-image-test-'));
  t.after(() => rm(home, { recursive: true, force: true }));
  return home;
}

async function setup(t, home, { credentials = new Map(), generateCloud, comfy = {} } = {}) {
  let endpoint;
  let tool;
  let dispose;
  let disposeScope;
  const tools = {
    register(definition) {
      assert.equal(tool, undefined, 'remove old registrations before updating the provider list');
      assert.equal(definition.name, 'fps_generate_image');
      tool = definition;
      return () => { tool = undefined; };
    },
  };
  const services = {
    tools,
    credentials: {
      resolve: async (name) => credentials.has(name) ? { value: credentials.get(name), source: 'file' } : undefined,
      set: async (name, value) => credentials.set(name, value),
      unset: async (name) => credentials.delete(name),
    },
    launchEnvironment: { get: () => ({ value: '' }) },
  };
  await registerImageGeneration({
    connection: { fetch: { register: (value) => { endpoint = value; } } },
    effect: (setupEffect) => { dispose = setupEffect(); },
    inject: (_names, activate) => activate({ tools, effect: (setupEffect) => { disposeScope = setupEffect(); } }),
    get: (name) => services[name],
    logger: { warn: (message) => assert.fail(message) },
  }, {
    home,
    generateCloud: generateCloud ?? (() => assert.fail('Unexpected cloud generation')),
    createComfy: () => ({
      status: async () => ({ state: 'missing' }),
      install: () => assert.fail('Unexpected ComfyUI installation'),
      cancelInstall() {},
      dispose() {},
      ...comfy,
    }),
  });
  const close = () => {
    dispose?.();
    disposeScope?.();
    dispose = undefined;
    disposeScope = undefined;
  };
  t.after(close);

  async function settings(input, status = 200) {
    const url = `http://localhost${endpoint.path}`;
    const request = input ? new Request(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    }) : new Request(url);
    const response = await endpoint.fetch(request);
    assert.equal(response.status, status);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    const body = await response.text();
    assert.ok(!body.includes(API_KEY), 'settings never echo the API key');
    return JSON.parse(body);
  }

  return {
    settings,
    close,
    get tool() { return tool; },
    toggle: (provider, enabled) => settings({ action: 'toggle', provider, enabled }),
    providers: () => tool?.parameters.properties.provider.enum ?? [],
  };
}

test('FPS image providers start off and register tools only while enabled', async (t) => {
  const host = await setup(t, await testHome(t));
  const initial = await host.settings();
  assert.deepEqual(Object.values(initial.providers).map(({ enabled }) => enabled), [false, false, false, false]);
  assert.equal(initial.providers.comfy.setup.state, 'off');
  assert.equal(host.tool, undefined);

  await host.toggle('z-image', true);
  assert.deepEqual(host.providers(), ['z-image']);
  await host.toggle('z-image', false);
  assert.equal(host.tool, undefined);
});

test('FPS persists toggles and keeps API keys in the DSH credential store', async (t) => {
  const home = await testHome(t);
  const credentials = new Map();
  const first = await setup(t, home, { credentials });
  const enabled = await first.toggle('cogview', true);
  assert.equal(enabled.providers.cogview.configured, false);
  assert.equal(first.tool, undefined);

  const keyed = await first.settings({ action: 'saveKey', provider: 'cogview', key: API_KEY });
  assert.equal(keyed.providers.cogview.stored, true);
  assert.equal(credentials.get('FPS_COGVIEW_API_KEY'), API_KEY);
  assert.deepEqual(first.providers(), ['cogview']);
  const persisted = JSON.parse(await readFile(join(home, 'plugins', 'fps-image-generation', 'settings.json'), 'utf8'));
  assert.deepEqual(persisted, { enabled: { cogview: true } });

  first.close();
  const reopened = await setup(t, home, { credentials });
  assert.deepEqual(reopened.providers(), ['cogview']);
  const cleared = await reopened.settings({ action: 'saveKey', provider: 'cogview', key: '' });
  assert.equal(cleared.providers.cogview.configured, false);
  assert.equal(reopened.tool, undefined);
});

test('FPS writes a native preview path and does not switch providers after a failure', async (t) => {
  const home = await testHome(t);
  const calls = [];
  const denied = new Error('Mock provider quota exhausted');
  const host = await setup(t, home, {
    credentials: new Map([['FPS_COGVIEW_API_KEY', API_KEY]]),
    async generateCloud(provider, { prompt, aspectRatio, apiKey }) {
      calls.push({ provider, prompt, aspectRatio, apiKey });
      if (provider === 'z-image') throw denied;
      return { bytes: IMAGE, extension: 'png' };
    },
  });
  await host.toggle('z-image', true);
  await host.toggle('cogview', true);

  const result = await host.tool.execute({ prompt: ' A lighthouse ', provider: 'cogview', aspectRatio: '16:9' }, EXECUTION);
  assert.equal(result.provider, 'cogview');
  assert.equal(dirname(result.path), join(home, 'generated'));
  assert.match(basename(result.path), /^fps-image-[\da-f-]+\.png$/);
  assert.deepEqual(await readFile(result.path), IMAGE);
  assert.deepEqual(calls, [{ provider: 'cogview', prompt: 'A lighthouse', aspectRatio: '16:9', apiKey: API_KEY }]);

  await assert.rejects(host.tool.execute({ prompt: 'Another lighthouse' }, EXECUTION), (error) => error === denied);
  assert.deepEqual(calls.map(({ provider }) => provider), ['cogview', 'z-image']);
  assert.deepEqual(await readdir(join(home, 'generated')), [basename(result.path)]);
});

test('ComfyUI becomes selectable after explicit setup and never installs on enable', async (t) => {
  let state = 'missing';
  let installCalls = 0;
  let finishInstall;
  const host = await setup(t, await testHome(t), {
    comfy: {
      status: async () => ({ state }),
      install() {
        installCalls++;
        state = 'installing';
        return new Promise((resolve) => {
          finishInstall = () => { state = 'ready'; resolve(); };
        });
      },
      generate: async () => ({ bytes: IMAGE, extension: 'png' }),
    },
  });
  await host.settings({ action: 'installComfy' }, 400);
  await host.toggle('comfy', true);
  assert.equal(installCalls, 0);
  assert.equal(host.tool, undefined);

  const pending = await host.settings({ action: 'installComfy' });
  assert.equal(installCalls, 1);
  assert.equal(pending.providers.comfy.setup.state, 'installing');
  assert.equal(host.tool, undefined);
  finishInstall();
  await host.settings();
  assert.deepEqual(host.providers(), ['comfy']);
  const result = await host.tool.execute({ prompt: 'A local image', provider: 'comfy' }, EXECUTION);
  assert.equal(result.provider, 'comfy');
  assert.deepEqual(await readFile(result.path), IMAGE);
});
