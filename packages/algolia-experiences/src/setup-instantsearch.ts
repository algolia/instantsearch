/** @jsx h */

import { liteClient as algoliasearch } from 'algoliasearch/lite';
import InstantSearch from 'instantsearch.js/es/lib/InstantSearch';

import { fetchConfiguration } from './get-configuration';
import { getElements, getSettings } from './get-information';
import { configToIndex, injectStyles } from './render';
import { error } from './util';

import type { Settings } from './get-information';
import type { IndexWidget } from 'instantsearch.js';

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

    if (!customElements.get('algolia-experience')) {
      registerComponents(search, settings);
    }

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

function registerComponents(search: InstantSearch, settings: Settings) {
  class AlgoliaExperience extends HTMLElement {
    static observedAttributes = ['experience-id'];

    widgets: IndexWidget[] = [];

    connectedCallback() {
      const experienceId = this.getAttribute('experience-id');
      if (!experienceId) {
        error('Experience ID is required');
        return;
      }

      fetchConfiguration([experienceId], settings).then((configuration) => {
        this.widgets = configToIndex(
          configuration[0],
          new Map([[experienceId, this]])
        );
        search.addWidgets(this.widgets);
        if (!search.started) {
          search.start();
        }
      });
    }

    disconnectedCallback() {
      search.removeWidgets(this.widgets);
    }
  }
  customElements.define('algolia-experience', AlgoliaExperience);
}
