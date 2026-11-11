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
  assert.deepEqual(outputs.wire.view(state), [
    '/work/report.md', '/other/deliverables/生成 图片.png', '/work/my clip.mp4', '/other/draft(v2).md',
  ]);
});

test('interrupted replies and intermediate tool messages do not publish links', () => {
  const initial = outputs.init({ cwd: '/work' });
  assert.equal(outputs.apply(initial, reply('[Draft](draft.md)', [], true)), initial);
  assert.equal(outputs.apply(initial, reply('[Draft](draft.md)', [{ type: 'tool-call' }])), initial);
});
