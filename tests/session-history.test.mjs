import assert from 'node:assert/strict';
import test from 'node:test';
import { loadClientPlugin } from './client-harness.mjs';

function source(snapshot) {
  const listeners = new Set();
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    set(value) {
      snapshot = value;
      for (const listener of listeners) listener();
    },
  };
}

test('history restores visits and skips unavailable conversations when branching', async () => {
  const { testHooks: { createSessionHistory } } = await loadClientPlugin();
  const selection = source({ sessionId: 'a' });
  const sessions = { list: source({ byId: { a: {}, b: {}, c: {}, d: {} } }) };
  const workspaces = { list: source({ archivedSessionIds: [] }) };
  const opens = [];
  const history = createSessionHistory({
    selection,
    openSession(sessionId) {
      opens.push(sessionId);
      selection.set({ sessionId });
    },
  }, sessions, workspaces, () => {});

  assert.deepEqual(history.getSnapshot(), { back: false, forward: false });
  selection.set({ sessionId: 'b' });
  selection.set({ sessionId: 'c' });
  workspaces.list.set({ archivedSessionIds: ['b'] });
  history.go(-1);
  assert.deepEqual(opens, ['a']);
  assert.deepEqual(history.getSnapshot(), { back: false, forward: true });
  history.go(1);
  assert.deepEqual(opens, ['a', 'c']);
  history.go(-1);
  selection.set({ sessionId: 'd' });
  assert.deepEqual(history.getSnapshot(), { back: true, forward: false });
  sessions.list.set({ byId: { d: {} } });
  assert.deepEqual(history.getSnapshot(), { back: false, forward: false });
  history.dispose();
});
