/** @jsx h */

import { liteClient as algoliasearch } from 'algoliasearch/lite';
import InstantSearch from 'instantsearch.js/es/lib/InstantSearch';

import { fetchConfiguration } from './get-configuration';
import { getElements, getSettings } from './get-information';
import { configToIndex, injectStyles } from './render';
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

    fetchConfiguration([...elements.keys()], settings).then((configuration) => {
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
