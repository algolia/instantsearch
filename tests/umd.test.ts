import { readFileSync } from 'fs';
import { resolve } from 'path';

import { JSDOM } from 'jsdom';

/**
 * Adds a UMD script to the JSDOM window
 * @param window A reference to the window provided by JSDOM
 * @param path The path to the bundle relative to the root of the project
 */
function addScript(window: JSDOM['window'], path: string) {
  const bundle = readFileSync(resolve(process.cwd(), path), 'utf8');

  const script = window.document.createElement('script');
  script.textContent = bundle;
  window.document.body.appendChild(script);
}

describe('UMD bundle', () => {
  test.each([
    {
      name: 'algoliasearch-helper',
      bundle: 'dist/algoliasearch.helper.min.js',
      globalName: 'algoliasearchHelper',
    },
    {
      name: 'instantsearch.js',
      bundle: 'dist/instantsearch.production.min.js',
      globalName: 'instantsearch',
    },
    {
      name: 'react-instantsearch',
      bundle: 'dist/umd/ReactInstantSearch.min.js',
      globalName: 'ReactInstantSearch',
      dependency: 'node_modules/react/umd/react.production.min.js',
    },
    {
      name: 'react-instantsearch-core',
      bundle: 'dist/umd/ReactInstantSearchCore.min.js',
      globalName: 'ReactInstantSearchCore',
      dependency: 'node_modules/react/umd/react.production.min.js',
    },
    {
      name: 'vue-instantsearch',
      bundle: 'vue2/umd/index.js',
      globalName: 'VueInstantSearch',
      dependency: 'node_modules/vue/dist/vue.min.js',
    },
  ])('$name loads successfully', ({ name, bundle, globalName, dependency }) => {
    const { window } = new JSDOM('', { runScripts: 'dangerously' });

    const errorFn = jest.fn();
    window.addEventListener('error', errorFn);

    if (dependency) {
      addScript(window, dependency);
    }

    addScript(window, `packages/${name}/${bundle}`);

    expect(errorFn).not.toHaveBeenCalled();
    expect(window[globalName]).toBeDefined();
  });
});
