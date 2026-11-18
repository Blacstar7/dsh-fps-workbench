import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { apply } from '../index.js';
import { loadClientPlugin } from './client-harness.mjs';

test('output confirmation fingerprints bytes and detects changes during a read', async () => {
  const { outputFingerprint } = (await loadClientPlugin()).testHooks;
  const signal = new AbortController().signal;
  const result = (value) => ({ ok: true, value });
  const file = { path: '/cover.svg', bytes: 3, version: 'first' };
  let contents = 'red';
  let current = 'first';
  const service = {
    async readBytes(session, path) {
      assert.equal(session, 'session');
      assert.equal(path, file.path);
      return result({ data: Buffer.from(contents), version: current, eof: true });
    },
    async stat() { return result({ version: current }); },
  };
  const before = await outputFingerprint(service, 'session', file, signal);
  current = 'second';
  assert.deepEqual(await outputFingerprint(service, 'session', { ...file, version: current }, signal), before);
  contents = 'sky';
  assert.notEqual((await outputFingerprint(service, 'session', { ...file, version: current }, signal)).digest, before.digest);
  service.stat = async () => result({ version: 'third' });
  assert.deepEqual(await outputFingerprint(service, 'session', { ...file, version: current }, signal), { status: 'stale' });
  assert.deepEqual(await outputFingerprint(service, 'session', { ...file, bytes: 9 * 1024 * 1024 }, signal),
    { status: 'tooLarge' });
});

test('a selected vision route matches both identifiers and a failure never tries a different provider', async (t) => {
  const home = await mkdtemp(join(tmpdir(), 'fps-vision-test-'));
  const previousHome = process.env.DSH_HOME;
  process.env.DSH_HOME = home;
  t.after(async () => {
    if (previousHome === undefined) delete process.env.DSH_HOME;
    else process.env.DSH_HOME = previousHome;
    await rm(home, { recursive: true, force: true });
  });
  const endpoints = new Map();
  const calls = [];
  let failedProvider;
  await apply({
    connection: { fetch: { register: (handler) => endpoints.set(handler.path, handler.fetch) } },
    sessionProjections: { register() {} },
    attachments: { admitPromptContent: async (parts) => parts },
    effect() {}, inject() {},
    llm: {
      listProviders: () => [{ id: 'first', name: 'First' }, { id: 'second', name: 'Second' }],
      listModels: async () => [
        { id: 'text-only', inputModalities: ['text'] },
        { id: 'shared', name: 'Shared', inputModalities: ['text', 'image'] },
      ],
      async *stream({ provider, model }) {
        calls.push({ provider, model });
        if (provider === failedProvider) {
          yield { type: 'finish', reason: { kind: 'failed', failure: { code: 'MISSING_CREDENTIAL' } } };
          return;
        }
        yield { type: 'text-delta', text: provider };
        yield { type: 'finish', reason: { kind: 'stop' } };
      },
    },
  });
  const catalogUrl = 'http://localhost/api/workbench/visionModels';
  const catalog = await endpoints.get('/api/workbench/visionModels')(new Request(catalogUrl));
  assert.deepEqual((await catalog.json()).models.map(({ provider, model }) => [provider, model]),
    [['first', 'shared'], ['second', 'shared']]);
  const url = 'http://localhost/api/workbench/describeImages';
  function describe(route) {
    return endpoints.get('/api/workbench/describeImages')(new Request(url, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ route, question: 'Describe the sample', images: [{ data: 'AA==', mediaType: 'image/png' }] }),
    }));
  }
  const chosen = { provider: 'second', model: 'shared' };
  const successful = await describe(chosen);
  assert.deepEqual(await successful.json(), { description: 'second' });
  failedProvider = 'second';
  const failed = await describe(chosen);
  assert.equal(failed.status, 502);
  assert.deepEqual(await failed.json(), { code: 'VISION_ROUTE_FAILED' });
  assert.equal((await describe({ provider: 'first', model: 'text-only' })).status, 502);
  assert.deepEqual(calls, [chosen, chosen]);
  failedProvider = 'first';
  assert.deepEqual(await (await describe()).json(), { description: 'second' });
  assert.deepEqual(calls.slice(2), [{ provider: 'first', model: 'shared' }, chosen]);
});
