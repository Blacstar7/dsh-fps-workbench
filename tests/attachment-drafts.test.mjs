import assert from 'node:assert/strict';
import test from 'node:test';
import { loadClientPlugin } from './client-harness.mjs';

test('attachment drafts survive session changes and clear only after acceptance', async () => {
  const { testHooks: { createAttachmentDrafts } } = await loadClientPlugin();
  const drafts = createAttachmentDrafts();
  const image = new File(['image'], 'preview.png', { type: 'image/png' });
  const file = new File(['notes'], 'notes.md');
  drafts.replace('a', 'images', () => [image]);
  drafts.replace('a', 'files', () => [file]);
  drafts.replace('b', 'files', () => [new File(['other'], 'other.md')]);
  assert.equal(drafts.read('b').images.length, 0);
  assert.equal(drafts.read('a').images[0], image);

  const rejected = drafts.begin('a');
  assert.equal(drafts.begin('a'), null);
  drafts.finish('a', rejected);
  assert.equal(drafts.read('a').files[0], file);

  const retry = drafts.begin('a');
  drafts.finish('a', rejected, true);
  assert.equal(drafts.read('a').files[0], file);
  drafts.finish('a', retry, true);
  assert.deepEqual(drafts.read('a'), { images: [], files: [], submission: null });
  assert.equal(drafts.read('b').files[0].name, 'other.md');
});

function memoryStorage() {
  const rows = new Map();
  return {
    rows,
    async load() { return [...rows].map(([id, value]) => ({ id, ...value })); },
    async save(id, value) {
      if (value.images.length || value.files.length) rows.set(id, { images: value.images, files: value.files });
      else rows.delete(id);
    },
  };
}

test('durable attachment bytes recover after a new client instance; acceptance deletes only its session', async () => {
  const { testHooks: { createAttachmentDrafts } } = await loadClientPlugin();
  const storage = memoryStorage();
  const first = createAttachmentDrafts(storage);
  await first.ready;
  first.replace('a', 'images', () => [new File(['pixels'], 'test.png', { type: 'image/png' })]);
  first.replace('a', 'files', () => [new File(['draft content'], 'test.md')]);
  first.replace('b', 'files', () => [new File(['other'], 'other.md')]);
  await first.flush();
  const second = createAttachmentDrafts(storage);
  assert.equal(second.begin('a'), null, 'sending waits for hydration');
  await second.ready;
  assert.equal(await second.read('a').files[0].text(), 'draft content');
  assert.equal(second.read('a').images[0].type, 'image/png');
  const token = second.begin('a');
  second.finish('a', token, true);
  await second.flush();
  const third = createAttachmentDrafts(storage);
  await third.ready;
  assert.equal(third.read('a').files.length, 0);
  assert.equal(third.read('b').files.length, 1);
});

test('an in-flight submission restores as an editable draft, failed storage retains memory', async () => {
  const { testHooks: { createAttachmentDrafts } } = await loadClientPlugin();
  const storage = memoryStorage();
  const first = createAttachmentDrafts(storage);
  await first.ready;
  first.replace('a', 'files', () => [new File(['notes'], 'notes.md')]);
  await first.flush();
  first.begin('a');
  const second = createAttachmentDrafts(storage);
  await second.ready;
  assert.equal(second.read('a').submission, null);
  assert.equal(second.read('a').files.length, 1);
  storage.save = async () => { throw new Error('quota'); };
  second.replace('a', 'files', (files) => [...files, new File(['more'], 'more.md')]);
  await second.flush();
  assert.equal(second.status(), 'error');
  assert.equal(second.read('a').files.length, 2);
});

test('late hydration cannot overwrite a newer attachment edit', async () => {
  const { testHooks: { createAttachmentDrafts } } = await loadClientPlugin();
  let resolve;
  const storage = { load: () => new Promise((done) => { resolve = done; }), save: async () => {} };
  const drafts = createAttachmentDrafts(storage);
  drafts.replace('a', 'files', () => [new File(['new'], 'new.md')]);
  resolve([{ id: 'a', images: [], files: [new File(['old'], 'old.md')] }]);
  await drafts.flush();
  assert.equal(drafts.read('a').files[0].name, 'new.md');
});

test('failed accepted-draft deletion can be retried and another successful save cannot conceal it', async () => {
  const { testHooks: { createAttachmentDrafts } } = await loadClientPlugin();
  const storage = memoryStorage();
  const save = storage.save;
  const drafts = createAttachmentDrafts(storage);
  await drafts.ready;
  drafts.replace('a', 'files', () => [new File(['draft'], 'draft.md')]);
  await drafts.flush();
  storage.save = async (id, draft) => { if (id === 'a') throw new Error('locked'); return save(id, draft); };
  drafts.finish('a', drafts.begin('a'), true);
  drafts.replace('b', 'files', () => [new File(['b'], 'b.md')]);
  await drafts.flush();
  assert.equal(drafts.status(), 'error');
  storage.save = save;
  await drafts.retry();
  assert.equal(storage.rows.has('a'), false);
  assert.equal(storage.rows.has('b'), true);
  assert.equal(drafts.status(), 'saved');
});

test('a transient storage read failure can recover the original saved attachments', async () => {
  const { testHooks: { createAttachmentDrafts } } = await loadClientPlugin();
  const storage = memoryStorage();
  storage.rows.set('a', { images: [], files: [new File(['old'], 'old.md')] });
  const load = storage.load;
  storage.load = async () => { throw new Error('unavailable'); };
  const drafts = createAttachmentDrafts(storage);
  await drafts.ready;
  assert.equal(drafts.status(), 'error');
  storage.load = load;
  await drafts.retry();
  assert.equal(drafts.read('a').files[0].name, 'old.md');
});

test('a stalled IndexedDB open releases the draft loading lock and closes a late connection', async () => {
  const { testHooks: { createAttachmentStorage, createAttachmentDrafts } } = await loadClientPlugin();
  const requests = [];
  const storage = createAttachmentStorage({ open() { const request = {}; requests.push(request); return request; } }, 10);
  const drafts = createAttachmentDrafts(storage);
  await drafts.ready;
  assert.equal(drafts.status(), 'error');
  assert.ok(drafts.begin('text-session'), 'plain text submission can proceed after storage failure');
  let closed = false;
  requests[0].result = { close() { closed = true; } };
  requests[0].onsuccess();
  assert.equal(closed, true);
  await assert.rejects(storage.load(), /timed out/);
  assert.equal(requests.length, 2, 'retry opens a fresh connection');
});

test('a stalled IndexedDB write is aborted before retry, so it cannot commit late', async () => {
  const { testHooks: { createAttachmentStorage } } = await loadClientPlugin();
  let tx, aborted = false;
  const db = { close() {}, transaction() {
    tx = { objectStore() { return { put() { return {}; } }; }, abort() { aborted = true; } };
    return tx;
  } };
  const storage = createAttachmentStorage({ open() {
    const request = { result: db }; queueMicrotask(() => request.onsuccess()); return request;
  } }, 10);
  await assert.rejects(storage.save('a', { images: [], files: [new File(['x'], 'x.md')] }), /timed out/);
  assert.equal(aborted, true);
  assert.doesNotThrow(() => tx.oncomplete());
});
