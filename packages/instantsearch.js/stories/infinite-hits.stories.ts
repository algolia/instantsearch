import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/html';

import { withHits } from '../.storybook/decorators';
import { createInfiniteHitsSessionStorageCache } from '../src/lib/infiniteHitsCache';

import type { InsightsClient } from '../src/types';

const fakeInsightsClient: InsightsClient = (method, ...payloads) => {
  const [payload] = payloads;
  action(`[InsightsClient] sent ${method} with payload`)(payload);
};

storiesOf('Results/InfiniteHits', module)
  .add(
    'default',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.infiniteHits({
          container,
          templates: {
            item: ({ name }) => name,
          },
        }),
      ]);
    })
  )
  .add(
    'with custom "showMoreText" template',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.infiniteHits({
          container,
          templates: {
            item: ({ name }) => name,
            showMoreText: 'Load more',
          },
        }),
      ]);
    })
  )
  .add(
    'with transformed items',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.infiniteHits({
          container,
          templates: {
            item: '{{name}}',
          },
          transformItems: (items) =>
            items.map((item) => ({
              ...item,
              name: `${item.name} (transformed)`,
            })),
        }),
      ]);
    })
  )
  .add(
    'with insights helper',
    withHits(
      ({ search, container, instantsearch }) => {
        search.addWidgets([
          instantsearch.widgets.configure({
            attributesToSnippet: ['name', 'description'],
            clickAnalytics: true,
          }),
        ]);

        search.addWidgets([
          instantsearch.widgets.infiniteHits({
            container,
            templates: {
              item: (item, { html, sendEvent }) => html`
                <h4>${item.name}</h4>
                <button
                  onClick=${() =>
                    sendEvent(
                      'clickedObjectIDsAfterSearch',
                      [item],
                      'Add to cart'
                    )}
                >
                  Add to cart
                </button>
              `,
            },
          }),
        ]);
      },
      {
        insightsClient: fakeInsightsClient,
      }
    )
  )
  .add(
    'with previous button enabled',
    withHits(
      ({ search, container, instantsearch }) => {
        search.addWidgets([
          instantsearch.widgets.infiniteHits({
            container,
            showPrevious: true,
            templates: {
              item: '{{name}}',
            },
          }),
        ]);
      },
      {
        initialUiState: {
          instant_search: {
            page: 3,
          },
        },
      }
    )
  )
  .add(
    'with sessionStorage cache enabled',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.configure({
          hitsPerPage: 24,
        }),
        instantsearch.widgets.infiniteHits({
          container,
          templates: {
            item: (hit) => `
              <p>#${hit.__position} ${hit.name}</p>
              <a href="https://google.com">Details</a>
            `,
          },
          cache: createInfiniteHitsSessionStorageCache(),
        }),
      ]);
    })
  );
