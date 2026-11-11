import { pathToFileURL } from 'node:url';

const CLIENT_URL = new URL('../client.js', import.meta.url);
let cachedPlugin;

/** Load the browser bundle with only the module-table primitives it needs. */
export async function loadClientPlugin() {
  if (cachedPlugin) return cachedPlugin;
  let loaded;
  const previousWindow = globalThis.window;
  const previousRequire = globalThis.require;

  class Component {
    constructor(props) {
      this.props = props;
      this.state = {};
    }

    setState() {}
  }

  globalThis.window = {
    __CLAUDE_WORKBENCH_TEST__: true,
    __ModuleLoader__: {
      load(config) {
        loaded = config;
      },
    },
  };

  globalThis.require = (id) => {
    if (id === 'react') {
      return {
        createElement() {},
        Component,
        Fragment: 'Fragment',
        useState: () => [undefined, () => {}],
        useEffect() {},
        useLayoutEffect() {},
        useRef: () => ({ current: undefined }),
      };
    }
    if (id === 'react-dom') return { createPortal: () => null };
    throw new Error(`unexpected client module: ${id}`);
  };

  try {
    await import(`${pathToFileURL(CLIENT_URL.pathname).href}?test=${Date.now()}`);
    if (!loaded) throw new Error('client bundle did not register a module');
    cachedPlugin = loaded.factory(globalThis.require);
    return cachedPlugin;
  } finally {
    globalThis.window = previousWindow;
    globalThis.require = previousRequire;
  }
}
