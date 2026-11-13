import assert from 'node:assert/strict';
import test from 'node:test';
import { loadClientPlugin } from './client-harness.mjs';

test('native task statuses keep live rows first and preserve terminal timestamps', async () => {
  const { testHooks: { orderJobs, jobElapsed } } = await loadClientPlugin();
  const rows = [
    { id: 'done', status: 'completed', startedAt: 1000, finishedAt: 61000 },
    { id: 'failed', status: 'failed', startedAt: 10000, finishedAt: 80000 },
    { id: 'live', status: 'running', startedAt: 1000 },
    { id: 'stopping', status: 'stopping', startedAt: 2000 },
  ];
  assert.deepEqual(orderJobs(rows).map((r) => r.id), ['live', 'stopping', 'failed', 'done']);
  assert.equal(jobElapsed(rows[0], 999999), '1m 0s');
  assert.equal(jobElapsed(rows[2], 62000), '1m 1s');
  assert.equal(jobElapsed({ status: 'unknown', startedAt: 1 }, 100), '—');
  assert.equal(rows[0].id, 'done');
});

test('capability checks degrade optional services independently and perform no actions', async () => {
  const { testHooks: { compatibilityChecks } } = await loadClientPlugin();
  const forbidden = () => { throw new Error('self-check must not execute service methods'); };
  const slots = { register: forbidden, inject: forbidden, subscribe: forbidden, entriesOfSlot: forbidden };
  const services = { fileUploads: { upload: forbidden }, workspaceFiles: { stat: forbidden },
    sidebarRight: { openResource: forbidden }, jobs: { watchRows: forbidden,
      state: { subscribe: forbidden, getSnapshot: forbidden } } };
  assert.ok(compatibilityChecks(services, slots, 'saved').every(([, ok]) => ok));
  const missing = Object.fromEntries(compatibilityChecks({ ...services, jobs: undefined, composerFallback: true }, slots, 'error'));
  assert.equal(missing.compatComposer, false);
  assert.equal(missing.compatJobs, false);
  assert.equal(missing.compatStorage, false);
  assert.equal(missing.compatPreview, true);
});

test('missing composer props unregister only the FPS contribution and leave native controls registered', async () => {
  const { testHooks: { registerComposer } } = await loadClientPlugin();
  const entries = new Map([['native', () => {}]]);
  let component;
  const cleanup = registerComposer({
    register(options, value) { component = value; entries.set('fps', value); return () => entries.delete('fps'); },
    subscribe() { return () => {}; }, entriesOfSlot() { return []; },
  });
  assert.equal(entries.size, 2);
  component({});
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual([...entries.keys()], ['native']);
  cleanup();
  assert.equal(entries.has('native'), true);
});

test('partial slot setup failure cannot leave the FPS composer overriding the native input', async () => {
  const { testHooks: { registerComposer } } = await loadClientPlugin();
  let registered = false;
  const cleanup = registerComposer({
    register() { registered = true; return () => { registered = false; }; },
    subscribe() { throw new Error('slot contract changed'); }, entriesOfSlot() { return []; },
  });
  assert.equal(registered, false);
  assert.doesNotThrow(cleanup);
});

function nativeSlots() {
  const voice = { locale: 'voice-input', component: () => {}, inject: () => ({ native: true }) };
  const job = { options: { id: 'job-list' }, locale: 'job', component: () => {}, inject: () => ({ native: true }) };
  const sources = new Map([
    ['conversation.input.activity', [{ locale: 'unrelated', component: () => {} }, voice]],
    ['conversation.session.header.actions', [job]],
  ]);
  const listeners = new Map(), mirrors = new Map();
  let failRegister = false;
  const slots = {
    sources, mirrors, voice, job, listeners,
    register(options, component) {
      if (failRegister) throw new Error('child slot unavailable');
      const entry = { options, component };
      mirrors.set(options.name, entry);
      return () => { if (mirrors.get(options.name) === entry) mirrors.delete(options.name); };
    },
    subscribe(name, callback) {
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name).add(callback);
      return () => listeners.get(name).delete(callback);
    },
    entriesOfSlot(name) { return sources.get(name) || []; },
    emit(name) { for (const listener of listeners.get(name) || []) listener(); },
    failRegistration(value) { failRegister = value; },
  };
  return slots;
}
const voiceSource = 'conversation.input.activity';
const voiceTarget = 'workbench.composer.voice';
const composerTarget = 'conversation.composer.bar';
const jobSource = 'conversation.session.header.actions';
const jobTarget = 'workbench.context.jobs';
const tick = () => new Promise((resolve) => setImmediate(resolve));

test('voice mirror finds native voice among other entries and follows disable / enable', async () => {
  const { testHooks: { registerComposer } } = await loadClientPlugin();
  const slots = nativeSlots();
  const cleanup = registerComposer(slots);
  assert.equal(slots.mirrors.get(voiceTarget).component, slots.voice.component);
  assert.equal(slots.mirrors.get(voiceTarget).options.inject, slots.voice.inject);
  slots.sources.set(voiceSource, []); slots.emit(voiceSource);
  assert.equal(slots.mirrors.has(voiceTarget), false);
  assert.equal(slots.mirrors.has(composerTarget), true);
  slots.sources.set(voiceSource, [slots.voice]); slots.emit(voiceSource);
  assert.equal(slots.mirrors.get(voiceTarget).component, slots.voice.component);
  cleanup(); cleanup();
  assert.equal(slots.listeners.get(voiceSource).size, 0);
  assert.equal(slots.mirrors.size, 0);
  assert.equal(slots.sources.get(voiceSource)[0], slots.voice);
});

test('native input fallback also releases the voice mirror and ignores late notifications', async () => {
  const { testHooks: { registerComposer } } = await loadClientPlugin();
  const slots = nativeSlots();
  const cleanup = registerComposer(slots);
  const staleCallback = [...slots.listeners.get(voiceSource)][0];
  slots.mirrors.get(composerTarget).component({});
  await tick();
  assert.equal(slots.mirrors.size, 0);
  assert.equal(slots.listeners.get(voiceSource).size, 0);
  staleCallback(); cleanup();
  assert.equal(slots.mirrors.size, 0);
  assert.equal(slots.sources.get(voiceSource).includes(slots.voice), true);
});

test('a queued fallback from an unloaded generation cannot unregister its replacement', async () => {
  const { testHooks: { registerComposer } } = await loadClientPlugin();
  const slots = nativeSlots();
  const first = registerComposer(slots);
  slots.mirrors.get(composerTarget).component({});
  first();
  const second = registerComposer(slots);
  await tick();
  assert.equal(slots.mirrors.has(composerTarget), true);
  assert.equal(slots.listeners.get(voiceSource).size, 1);
  second();
});

test('late voice activation failure does not throw into the native registry and restores native input', async () => {
  const { testHooks: { registerComposer } } = await loadClientPlugin();
  const slots = nativeSlots();
  slots.sources.set(voiceSource, []);
  const cleanup = registerComposer(slots);
  slots.sources.set(voiceSource, [slots.voice]); slots.failRegistration(true);
  assert.doesNotThrow(() => slots.emit(voiceSource));
  await tick();
  assert.equal(slots.mirrors.size, 0);
  assert.equal(slots.listeners.get(voiceSource).size, 0);
  cleanup();
});

test('job mirror survives native reload and isolates failed registration without touching native jobs', async () => {
  const { testHooks: { bridgeNativeJobs } } = await loadClientPlugin();
  const slots = nativeSlots();
  const cleanup = bridgeNativeJobs(slots);
  assert.equal(slots.mirrors.get(jobTarget).options.inject, slots.job.inject);
  slots.sources.set(jobSource, []); slots.emit(jobSource);
  assert.equal(slots.mirrors.has(jobTarget), false);
  slots.failRegistration(true); slots.sources.set(jobSource, [slots.job]);
  assert.doesNotThrow(() => slots.emit(jobSource));
  slots.failRegistration(false); slots.emit(jobSource);
  assert.equal(slots.mirrors.get(jobTarget).component, slots.job.component);
  cleanup(); cleanup(); slots.emit(jobSource);
  assert.equal(slots.mirrors.size, 0);
  assert.equal(slots.listeners.get(jobSource).size, 0);
  assert.equal(slots.sources.get(jobSource)[0], slots.job);
});
