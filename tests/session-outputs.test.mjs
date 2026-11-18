import assert from 'node:assert/strict';
import test from 'node:test';
import { sessionOutputsProjection as outputs } from '../session-outputs.js';

function reply(text, extraContent = [], interrupted = false) {
  return {
    type: 'assistant/message',
    data: { interrupted, message: { content: [{ type: 'text', text }, ...extraContent] } },
  };
}

test('completed assistant links add files to the same list as native deliverables', () => {
  const initial = outputs.init({ cwd: '/work' });
  const presented = outputs.apply(initial, {
    type: 'deliverables/presented', data: { files: [{ path: 'report.md' }] },
  });
  const moved = outputs.apply(presented, { type: 'working-directory/change', data: { cwd: '/other' } });
  const state = outputs.apply(moved, reply([
    '[Report](/work/report.md#L3)',
    '![Image](<deliverables/生成 图片.png>)',
    '[Clip](file:///work/my%20clip.mp4)',
    '[Draft](./draft(v2).md "Draft")',
    '[External](https://example.com/file.md)',
    '[Jump](#section)',
    '`[Example](/should-not-list.md)`',
    '```markdown\n[Example](/also-ignored.md)\n```',
  ].join('\n')));
  assert.deepEqual(outputs.wire.view(state).files, [
    '/work/report.md', '/other/deliverables/生成 图片.png', '/work/my clip.mp4', '/other/draft(v2).md',
  ]);
});

test('interrupted replies and intermediate tool messages do not publish links', () => {
  const initial = outputs.init({ cwd: '/work' });
  assert.equal(outputs.apply(initial, reply('[Draft](draft.md)', [], true)), initial);
  assert.equal(outputs.apply(initial, reply('[Draft](draft.md)', [{ type: 'tool-call' }])), initial);
});

test('FPS image calls appear in outputs before the assistant links the image', () => {
  const initial = outputs.init({ cwd: '/work' });
  const content = [{ type: 'text', text: 'Saved image to: /dsh/generated/fps-image.png (provider=z-image)' }];
  const call = outputs.apply(initial, { type: 'tool/call', data: { callId: 'image-1', name: 'fps_generate_image' } });
  const message = { source: { callId: 'image-1' }, content, isError: false };
  const direct = outputs.apply(call, { type: 'tool/result', data: { message } });
  const nested = outputs.apply(initial, {
    type: 'tool/ptc-dispatch', data: { name: 'fps_generate_image', subCallId: 'image-1', content, isError: false },
  });
  const failed = outputs.apply(call, { type: 'tool/result', data: { message: { ...message, isError: true } } });
  assert.deepEqual(outputs.wire.view(direct).files, ['/dsh/generated/fps-image.png']);
  assert.deepEqual(outputs.wire.view(nested), outputs.wire.view(direct));
  assert.deepEqual(outputs.wire.view(failed).files, []);
});

test('repeat deliveries and writes refresh existing paths while references preserve order', () => {
  const present = (files) => ({ type: 'deliverables/presented', data: { files: files.map((path) => ({ path })) } });
  const initial = outputs.apply(outputs.init({ cwd: '/work' }), present(['cover.png', 'review.md']));
  const reference = outputs.apply(initial, reply('[Cover](cover.png)'));
  assert.deepEqual(outputs.wire.view(reference).files, ['/work/cover.png', '/work/review.md']);
  assert.equal(outputs.wire.view(reference).revision, 2);
  const updated = outputs.apply(reference, present(['cover.png', '/work/cover.png']));
  assert.deepEqual(outputs.wire.view(updated).files, ['/work/review.md', '/work/cover.png']);
  assert.equal(outputs.wire.view(updated).revision, 3);
  const write = outputs.apply(updated, {
    type: 'tool/ptc-dispatch', data: { name: 'write', meta: { path: '/work/cover.png' }, isError: false },
  });
  assert.deepEqual(outputs.wire.view(write).files, ['/work/review.md', '/work/cover.png']);
  assert.equal(outputs.wire.view(write).revision, 4);
});

test('output origin retains a successful write and its recorded route across later references', () => {
  const initial = outputs.init({ cwd: '/work' });
  const model = outputs.apply(initial, {
    type: 'assistant/message', data: { turn: 2, step: 1, message: {
      content: [{ type: 'tool-call' }], source: { kind: 'model', provider: 'second-route', model: 'same-id' },
    } },
  });
  const called = outputs.apply(model, { type: 'tool/call', data: {
    turn: 2, step: 1, callId: 'edit-cover', name: 'write', arguments: { file_path: 'cover.svg' },
  } });
  const message = { source: { callId: 'edit-cover' }, content: [], isError: false };
  const successful = outputs.apply(called, { type: 'tool/result', data: { message } });
  const referenced = outputs.apply(successful, reply('[Cover](cover.svg) [Only linked](brief.md)'));
  assert.deepEqual(outputs.wire.view(referenced).sources, {
    '/work/cover.svg': { kind: 'write', name: 'write', turn: 2, step: 1, callId: 'edit-cover',
      provider: 'second-route', model: 'same-id' },
    '/work/brief.md': { kind: 'reference' },
  });
  const next = outputs.apply(referenced, { type: 'tool/call', data: {
    turn: 3, step: 1, callId: 'failed-edit', name: 'write', arguments: { file_path: 'cover.svg' },
  } });
  const failed = outputs.apply(next, {
    type: 'tool/result', data: { message: { ...message, source: { callId: 'failed-edit' }, isError: true } },
  });
  assert.deepEqual(outputs.wire.view(failed), outputs.wire.view(referenced));
});
