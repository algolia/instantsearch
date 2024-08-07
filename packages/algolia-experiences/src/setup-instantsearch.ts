/** @jsx h */
import algoliasearch from 'algoliasearch/lite';
import InstantSearch from 'instantsearch.js/es/lib/InstantSearch';

import { fakeFetchConfiguration } from './fake-configuration';
import { getElements, getSettings } from './get-information';
import { configToIndex } from './render';
import { error } from './util';

declare global {
  interface Window {
    __search: InstantSearch;
  }
}

export function setupInstantSearch() {
  try {
    const settings = getSettings();

    const searchClient = algoliasearch(settings.appId, settings.apiKey);
    const search = new InstantSearch({
      searchClient,
    });
    window.__search = search;

    const elements = getElements();

    injectStyles();

    fakeFetchConfiguration([...elements.keys()]).then((configuration) => {
      search
        .addWidgets(
          configuration.flatMap((config) => configToIndex(config, elements))
        )
        .start();
    });
  } catch (err) {
    error((err as Error).message);
  }
}

function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .ais-Columns {
      display: grid;
      grid-template-columns: minmax(min-content, 200px) 1fr;
      gap: 1em;
    }
  `;
  document.head.appendChild(style);
}
