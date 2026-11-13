import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { loadClientPlugin } from './client-harness.mjs';

test('published bundle resolves its settings panel after activation and reload', async () => {
  const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  const plugin = await loadClientPlugin();
  const entries = new Map();
  const nativeSettings = () => {};
  entries.set('native-plugin', nativeSettings);
  let dispose;
  const ctx = {
    get() {}, inject() {},
    configForms: { get() {} },
    locale: { bind: () => () => '' },
    effect(callback, label) {
      // Only activate the real delayed slot effect; presentation needs a browser DOM.
      if (label === 'claude-workbench: delayed slot registration') dispose = callback();
      return () => {};
    },
    slots: {
      inject(name, callback) {
        return name === 'plugins.bundle.config' ? callback() : () => {};
      },
      register(options, component) {
        entries.set(options.key, component);
        return () => entries.delete(options.key);
      },
    },
  };
  for (let activation = 0; activation < 2; activation++) {
    plugin.apply(ctx);
    try {
      await new Promise((resolve) => setTimeout(resolve, 10));
      assert.equal(typeof entries.get(manifest.name), 'function', 'host lookup must find FPS by its published bundle name');
      assert.equal(entries.size, 2, 'exactly one FPS settings panel is registered');
    } finally {
      dispose?.();
    }
    assert.deepEqual([...entries.keys()], ['native-plugin']);
    assert.equal(entries.get('native-plugin'), nativeSettings);
  }
});
