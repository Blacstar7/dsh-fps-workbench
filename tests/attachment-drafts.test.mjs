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
