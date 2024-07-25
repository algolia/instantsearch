import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import * as widgets from 'instantsearch.js/es/widgets';

import { fakeFetchConfiguration } from './fake-configuration';

const VERBOSE = true;

export function setupInstantSearch() {
  const metaConfiguration = document.querySelector<HTMLMetaElement>(
    'meta[name="instantsearch-configuration"]'
  );

  if (!metaConfiguration || !metaConfiguration.content) {
    error('No meta tag found');
    return;
  }

  const { appId, apiKey } = JSON.parse(metaConfiguration.content);

  if (!appId || !apiKey) {
    error('Missing appId or apiKey in the meta tag');
    return;
  }

  const searchClient = algoliasearch(appId, apiKey);
  const search = instantsearch({
    searchClient,
  });

  (window as any).__search = search;

  const elements = new Map<string, HTMLElement>();
  document
    .querySelectorAll<HTMLElement>('[data-instantsearch-id]')
    .forEach((element) => {
      const id = element.dataset.instantsearchId;
      if (!id) {
        error('No id found');
        return;
      }
      elements.set(id, element);
    });

  fakeFetchConfiguration([...elements.keys()]).then((configuration) => {
    search.addWidgets(
      configuration.flatMap((config) => {
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
                // eslint-disable-next-line import/namespace
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
      })
    );

    search.start();
  });
}

function error(message: string) {
  if (VERBOSE) {
    // eslint-disable-next-line no-console
    console.error(`[InstantSearch] ${message}`);
  }
}
