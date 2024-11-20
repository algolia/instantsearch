/** @jsx h */

import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { instantsearch } from 'instantsearch-core';

import { fetchConfiguration } from './get-configuration';
import { getSettings } from './get-information';
import { configToIndex, injectStyles } from './render';
import { error } from './util';

import type { Settings } from './get-information';
import type { IndexWidget, InstantSearch } from 'instantsearch-core';

declare global {
  interface Window {
    __search: InstantSearch;
  }
}

export function setupInstantSearch() {
  try {
    const settings = getSettings();

    const searchClient = algoliasearch(settings.appId, settings.apiKey);
    const search = instantsearch({
      searchClient,
    });
    window.__search = search;

    injectStyles();

    if (!customElements.get('algolia-experience')) {
      registerComponent(search, settings);
    }
  } catch (err) {
    error((err as Error).message);
  }
}

function registerComponent(search: InstantSearch, settings: Settings) {
  class AlgoliaExperience extends HTMLElement {
    static observedAttributes = ['experience-id'];

    widgets: IndexWidget[] = [];

    connectedCallback() {
      const id = this.getAttribute('experience-id');
      if (!id) {
        error('Experience ID is required');
        return;
      }

      fetchConfiguration(id, settings).then((config) => {
        this.widgets = configToIndex(config, this);
        search.addWidgets(this.widgets);

        if (!search.started) {
          search.start();
        }
      });
    }

    disconnectedCallback() {
      search.removeWidgets(this.widgets);
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
      if (oldValue === null || name !== 'experience-id') {
        return;
      }

      if (oldValue !== newValue) {
        this.disconnectedCallback();
        this.connectedCallback();
      }
    }
  }
  customElements.define('algolia-experience', AlgoliaExperience);
}
