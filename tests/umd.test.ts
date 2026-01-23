import { readFileSync } from 'fs';
import { resolve as resolvePath } from 'path';

import { JSDOM } from 'jsdom';

describe('UMD bundle', () => {
  describe.each([
    {
      name: 'algoliasearch-helper',
      bundle: 'dist/algoliasearch.helper.min.js',
      globalName: 'algoliasearchHelper',
    },
    {
      name: 'instantsearch.js',
      bundle: 'dist/instantsearch.production.min.js',
      globalName: 'instantsearch',
      unavailable: ['connectors.connectChat', 'widgets.chat'],
    },
    {
      name: 'react-instantsearch-core',
      bundle: 'dist/umd/ReactInstantSearchCore.js',
      globalName: 'ReactInstantSearchCore',
      dependencies: [
        'https://cdn.jsdelivr.net/npm/react@17/umd/react.production.min.js',
      ],
      unavailable: ['useChat'],
    },
    {
      name: 'react-instantsearch',
      bundle: 'dist/umd/ReactInstantSearch.js',
      globalName: 'ReactInstantSearch',
      dependencies: [
        'https://cdn.jsdelivr.net/npm/react@17/umd/react.production.min.js',
      ],
      unavailable: ['useChat', 'Chat'],
    },
    {
      name: 'vue-instantsearch',
      bundle: 'vue2/umd/index.js',
      globalName: 'VueInstantSearch',
      dependencies: ['https://cdn.jsdelivr.net/npm/vue@2/dist/vue.min.js'],
    },
    {
      name: 'vue-instantsearch',
      bundle: 'vue3/umd/index.js',
      globalName: 'VueInstantSearch',
      dependencies: [
        'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js',
      ],
    },
  ])('$bundle', ({ name, bundle, globalName, dependencies, unavailable }) => {
    test('loads successfully', async () => {
      const { window, error } = await createEnvironment(
        `packages/${name}/${bundle}`,
        dependencies
      );

      expect(error).not.toHaveBeenCalled();
      expect(window[globalName]).toBeDefined();
    });

    if (unavailable) {
      test.each(unavailable)(
        'throws when calling %s',
        async (componentPath) => {
          const { window } = await createEnvironment(
            `packages/${name}/${bundle}`,
            dependencies
          );

          const component = componentPath
            .split('.')
            .reduce((acc, path) => acc[path], window[globalName]);

          expect(() => component()).toThrow(
            /is not available from the UMD build/
          );
        }
      );
    }
  });
});

/**
 * Adds a UMD script to the JSDOM window
 * @param window Reference to the window provided by JSDOM
 * @param pathOrUrl Path to the bundle relative to the project's root or URL
 */
function addScript(
  window: JSDOM['window'],
  pathOrUrl: string
): Promise<void> | void {
  const script = window.document.createElement('script');

  if (pathOrUrl.startsWith('https')) {
    return new Promise((resolve, reject) => {
      script.src = pathOrUrl;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error(`Failed to load script: ${pathOrUrl}`));

      window.document.head.appendChild(script);
    });
  }

  const bundle = readFileSync(resolvePath(process.cwd(), pathOrUrl), 'utf8');
  script.textContent = bundle;

  window.document.body.appendChild(script);
  return Promise.resolve();
}

/**
 * Creates a JSDOM environment with the given bundle and dependencies
 * @param bundle Path to the bundle relative to the project's root
 * @param dependencies Array of dependencies
 */
async function createEnvironment(
  bundle: string,
  dependencies?: string[]
): Promise<{ window: JSDOM['window']; error: jest.Mock }> {
  const { window } = new JSDOM('', {
    runScripts: 'dangerously',
    resources: 'usable',
  });

  const error = jest.fn();
  window.addEventListener('error', error);

  if (dependencies) {
    for (const dependency of dependencies) {
      await addScript(window, dependency);
    }
  }

  await addScript(window, bundle);

  return new Promise((resolve) => {
    window.addEventListener('load', () => resolve({ window, error }));
  });
}
