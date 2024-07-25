/** @jsx h */
// @ts-ignore
import { liteClient } from 'algoliasearch/dist/lite/lite.esm.browser.js';
import InstantSearch from 'instantsearch.js/es/lib/InstantSearch';

import { fakeFetchConfiguration } from './fake-configuration';
import { getElements, getSettings } from './get-information';
import { configToIndex, injectStyles } from './render';
import { error } from './util';

import type { liteClient as liteClientType } from 'algoliasearch/lite';

declare global {
  interface Window {
    __search: InstantSearch;
  }
}

const algoliasearch = liteClient as typeof liteClientType;

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
