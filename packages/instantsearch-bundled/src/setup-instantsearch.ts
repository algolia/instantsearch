import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';

import { fakeFetchConfiguration } from './fake-configuration';
import { widgets } from './widgets';

import type { Configuration } from './types';
import type { InstantSearch } from 'instantsearch.js';

const VERBOSE = true;

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

    const elements = getElements();

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

function getSettings(): { appId: string; apiKey: string } {
  const metaConfiguration = document.querySelector<HTMLMetaElement>(
    'meta[name="instantsearch-configuration"]'
  );

  if (!metaConfiguration || !metaConfiguration.content) {
    throw new Error('No meta tag found');
  }

  const { appId, apiKey } = JSON.parse(metaConfiguration.content);

  if (!appId || !apiKey) {
    throw new Error('Missing appId or apiKey in the meta tag');
  }

  return { appId, apiKey };
}

function getElements() {
  const elements = new Map<string, HTMLElement>();
  document
    .querySelectorAll<HTMLElement>('[data-instantsearch-id]')
    .forEach((element) => {
      const id = element.dataset.instantsearchId!;
      elements.set(id, element);
    });

  return elements;
}

function configToIndex(
  config: Configuration,
  elements: Map<string, HTMLElement>
) {
  const container = elements.get(config.id);
  if (!container) {
    error(`Element with id ${config.id} not found`);
    return [];
  }

  return [
    widgets
      .index({
        indexName: config.indexName,
        indexId: config.id,
      })
      .addWidgets(
        config.children.flatMap((child) => {
          const widget: any = widgets[child.type];

          return widget({
            ...child.parameters,
            ...(child.type !== 'configure'
              ? {
                  container: container.appendChild(
                    document.createElement('div')
                  ),
                }
              : {}),
          });
        })
      ),
  ];
}

function error(message: string) {
  if (VERBOSE) {
    // eslint-disable-next-line no-console
    console.error(`[InstantSearch] ${message}`);
  }
}
