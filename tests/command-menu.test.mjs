import assert from 'node:assert/strict';
import test from 'node:test';
import { loadClientPlugin } from './client-harness.mjs';

async function hooks() {
  const plugin = await loadClientPlugin();
  assert.ok(plugin.testHooks, 'client exposes command-menu test hooks');
  return plugin.testHooks;
}

test('work summaries count settled nested operations and deduplicate file paths', async () => {
  const { summarizeWorkGroup } = await hooks();
  const result = (callId, name, args = {}, rest = {}) => ({
    callId, name, kind: 'tool-result', args: { value: (key) => args[key] }, ...rest,
  });
  const tool = result('ptc', 'run_code', {}, { subCalls: [
    result('read-1', 'read', { file_path: './notes.md' }),
    result('read-2', 'read', { file_path: 'notes.md' }),
    result('command', 'bash', { command: 'printf ok' }),
    result('poll', 'write_stdin'),
    result('edit', 'edit', {}, { meta: { path: '/workspace/notes.md' } }),
    result('patch', 'apply_patch', {}, { content: [
      { type: 'text', text: 'Success. Updated the following files:\nA /workspace/new.py\nM /workspace/notes.md' },
    ] }),
    result('failure', 'write', { file_path: 'failed.md' }, { isError: true }),
    { callId: 'pending', phase: 'preparing', name: 'bash' },
  ] });
  const t = (key) => ({
    workReadOne: 'Read 1 file',
    workCommandOne: 'Ran 1 command',
    workChanged: 'Changed {files}',
    workFailed: '{count} failed',
  })[key];
  assert.equal(summarizeWorkGroup([tool, tool.subCalls[2]], t),
    'Read 1 file · Ran 1 command · Changed notes.md, new.py · 1 failed');
  assert.equal(summarizeWorkGroup([result('image', 'mcp__media__generate_image')], t), '');
});

test('dictation replaces the captured selection and rejects edits to a different draft', async () => {
  const { voiceDraftInsertion } = await hooks();
  const draft = { sessionId: 'session-a', revision: 2, text: 'Before old after' };
  const selection = { sessionId: 'session-a', draftRev: 2, start: 7, end: 10 };
  assert.deepEqual(voiceDraftInsertion(draft, selection, '新内容'), {
    text: 'Before 新内容 after', caret: 10,
  });
  assert.equal(voiceDraftInsertion({ ...draft, revision: 3 }, selection, 'new'), null);
  assert.equal(voiceDraftInsertion({ ...draft, sessionId: 'session-b' }, selection, 'new'), null);
});

test('a slash query is recognized only at byte zero and before whitespace', async () => {
  const { commandQuery } = await hooks();
  assert.equal(commandQuery('/'), '');
  assert.equal(commandQuery('/mo'), 'mo');
  assert.equal(commandQuery('/model '), null);
  assert.equal(commandQuery('/model\n'), null);
  assert.equal(commandQuery(' /model'), null);
  assert.equal(commandQuery('hello /model'), null);
});

test('command rows filter by name, label, and description, case-insensitively', async () => {
  const { filterCommandRows } = await hooks();
  const rows = [
    { name: 'model', label: 'Model', description: 'Choose a model' },
    { name: 'goal', label: 'Goal', description: 'Set a long-running objective' },
    { name: 'compact', label: 'Compact', description: 'Shrink older history' },
  ];

  assert.deepEqual(filterCommandRows(rows, '').map((row) => row.name), ['model', 'goal', 'compact']);
  assert.deepEqual(filterCommandRows(rows, 'GOA').map((row) => row.name), ['goal']);
  assert.deepEqual(filterCommandRows(rows, 'choose').map((row) => row.name), ['model']);
  assert.deepEqual(filterCommandRows(rows, 'pact').map((row) => row.name), ['compact']);
  assert.deepEqual(filterCommandRows(rows, 'zzz'), []);
});

test('command rows ignore malformed catalog entries without throwing', async () => {
  const { filterCommandRows } = await hooks();
  const rows = [
    null,
    { name: 'goal' },
    { name: '', description: 'empty name' },
    { name: 'plan', label: 'Plan' },
  ];
  assert.deepEqual(filterCommandRows(rows, '').map((row) => row.name), ['goal', 'plan']);
  assert.deepEqual(filterCommandRows(rows, 'plan').map((row) => row.name), ['plan']);
});

test('catalog descriptors become stable menu rows and preserve argument commands', async () => {
  const { commandRowsFromDescriptors } = await hooks();
  const rows = commandRowsFromDescriptors([
    { name: 'goal', description: 'Set or view a goal' },
    { name: 'plan', description: 'Enter plan mode', input: { hint: '<message>' } },
    null,
    { name: '   ', description: 'invalid' },
  ]);

  assert.deepEqual(rows, [
    { name: 'goal', label: 'goal', description: 'Set or view a goal', hasInput: false, hint: '' },
    { name: 'plan', label: 'plan', description: 'Enter plan mode', hasInput: true, hint: '<message>' },
  ]);
});

test('inserting a command only adds a trailing space for commands with arguments', async () => {
  const { commandInsertion } = await hooks();
  assert.equal(commandInsertion({ name: 'plan', hasInput: true }), '/plan ');
  assert.equal(commandInsertion({ name: 'compact', hasInput: false }), '/compact');
});

test('model menu root picks the current provider group or the first usable group', async () => {
  const { rootModelGroup } = await hooks();
  const groups = [
    { id: 'glm', name: 'GLM', models: [{ id: 'glm-1' }] },
    { id: 'gpt', name: 'GPT', models: [{ id: 'gpt-1' }] },
  ];
  assert.equal(rootModelGroup(groups, { provider: 'gpt' }).id, 'gpt');
  assert.equal(rootModelGroup(groups, { provider: 'missing' }).id, 'glm');
  assert.equal(rootModelGroup(groups, undefined).id, 'glm');
  assert.equal(rootModelGroup([], undefined), null);
  assert.equal(rootModelGroup([{ id: 'empty', models: [] }], undefined)?.id, 'empty');
});

test('permission presets require confirmation exactly for high-risk modes', async () => {
  const { isDangerousPermission } = await hooks();
  assert.equal(isDangerousPermission('full-access'), true);
  assert.equal(isDangerousPermission('danger-full-access'), true);
  assert.equal(isDangerousPermission('auto'), true);
  assert.equal(isDangerousPermission('workspace-write'), false);
  assert.equal(isDangerousPermission('read-only'), false);
  assert.equal(isDangerousPermission('custom'), false);
  assert.equal(isDangerousPermission(undefined), false);
});

test('tool-call summaries expose name, phase, detail, and nested-call count', async () => {
  const { summarizeToolCall } = await hooks();
  assert.equal(summarizeToolCall(undefined), null);

  assert.deepEqual(summarizeToolCall({
    root: {
      phase: 'preparing', callId: 'call-1', name: 'bash',
      subCalls: [],
    },
  }), {
    callId: 'call-1', name: 'bash', status: 'preparing', detail: '', subCalls: 0,
  });

  assert.deepEqual(summarizeToolCall({
    root: {
      phase: 'start', callId: 'call-2', name: 'bash',
      argsRaw: '{"command":"npm test","description":"Run tests"}',
      subCalls: [],
    },
  }), {
    callId: 'call-2', name: 'bash', status: 'running', detail: 'Run tests', subCalls: 0,
  });

  assert.deepEqual(summarizeToolCall({
    root: {
      kind: 'tool-result', callId: 'call-3', name: 'apply_patch', isError: true,
      call: { name: 'apply_patch', argsRaw: '{"path":"a.ts"}' },
      subCalls: [],
    },
  }), {
    callId: 'call-3', name: 'apply_patch', status: 'error', detail: 'a.ts', subCalls: 0,
  });

  assert.equal(summarizeToolCall({
    root: { phase: 'start', callId: 'call-4', name: 'bash', argsRaw: '{bad', subCalls: [] },
  }).detail, '');
});

test('file sizes format as compact human-readable byte counts', async () => {
  const { formatBytes } = await hooks();
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(512), '512 B');
  assert.equal(formatBytes(2048), '2.0 KB');
  assert.equal(formatBytes(5 * 1024 * 1024), '5.0 MB');
  assert.equal(formatBytes(3 * 1024 * 1024 * 1024), '3.0 GB');
});

test('mentions replace a complete token at the caret and support quoted paths', async () => {
  const { mentionQuery } = await hooks();
  assert.deepEqual(mentionQuery('check @src later', 9), { query: 'sr', quoted: false, start: 6, end: 10 });
  assert.deepEqual(mentionQuery('look @"my folder/file" later', 16), {
    query: 'my folder', quoted: true, start: 5, end: 22,
  });
  assert.equal(mentionQuery('email a@b', 9), null);
  assert.deepEqual(mentionQuery('look at @', 9), { query: '', quoted: false, start: 8, end: 9 });
});

test('reference rows use native file and session mention syntax', async () => {
  const { referenceRows } = await hooks();
  const rows = referenceRows([
    { path: 'src', kind: 'directory' },
    { path: 'my folder/file.js', kind: 'file' },
    { path: 'unsupported"file', kind: 'file' },
  ], [{ sessionId: 'session-1', displayTitle: 'Prior conversation', mention: '@session:session-1' }], false);
  assert.deepEqual(rows.map(({ mention, icon }) => ({ mention, icon })), [
    { mention: '@src/', icon: 'folder' },
    { mention: '@"my folder/file.js"', icon: 'file' },
    { mention: '@session:session-1', icon: 'chat' },
  ]);
});

test('busy Enter honors DSH delivery preference and the modifier uses its complement', async () => {
  const { submitMode } = await hooks();
  const running = { running: true };
  assert.equal(submitMode(running, 'queue'), 'queue');
  assert.equal(submitMode(running, 'queue', true), 'steer');
  assert.equal(submitMode(running, 'steer'), 'steer');
  assert.equal(submitMode(running, 'steer', true), 'queue');
  assert.equal(submitMode({ running: false }, 'steer', true), 'queue');
  assert.equal(submitMode({ ...running, subagent: { address: { mode: 'inspect' } } }, 'steer'), 'queue');
  assert.equal(submitMode({ ...running, subagent: { address: { mode: 'continuable' } } }, 'steer'), 'steer');
});

test('context projections format token counts and occupancy percentages', async () => {
  const { formatTokenCount, contextPercent } = await hooks();
  assert.equal(formatTokenCount(999), '999');
  assert.equal(formatTokenCount(1200), '1.2K');
  assert.equal(formatTokenCount(1_500_000), '1.5M');
  assert.equal(contextPercent({ projectedTokens: 500, contextWindow: 1000 }), 50);
  assert.equal(contextPercent({ pressureTokens: 250, contextWindow: 1000 }), 25);
  assert.equal(contextPercent({ pressureTokens: 250 }), null);
  assert.equal(contextPercent(undefined), null);
});

test('host command execution distinguishes success, unmatched lines, and handler errors', async () => {
  const { executeHostCommand } = await hooks();
  const call = (line, value) => ({
    async execute(...args) {
      assert.deepEqual(args, ['session-1', line, []]);
      return { ok: true, value };
    },
  });

  assert.deepEqual(
    await executeHostCommand(call('/compact', { result: { kind: 'success' } }), 'session-1', '/compact'),
    { ok: true },
  );
  assert.deepEqual(
    await executeHostCommand(call('/missing', undefined), 'session-1', '/missing'),
    { ok: false, error: 'unmatched' },
  );
  assert.deepEqual(
    await executeHostCommand(call('/plan nope', { result: { kind: 'error', text: 'bad args' } }), 'session-1', '/plan nope'),
    { ok: false, error: 'bad args' },
  );
});
