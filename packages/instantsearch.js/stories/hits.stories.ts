import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/html';

import { withHits } from '../.storybook/decorators';

import type { InsightsClient } from '../src/types';

const fakeInsightsClient: InsightsClient = (method, ...payloads) => {
  const [payload] = payloads;
  action(`[InsightsClient] sent ${method} with payload`)(payload);
};

storiesOf('Results/Hits', module)
  .add(
    'default',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([instantsearch.widgets.hits({ container })]);
    })
  )
  .add(
    'with transformed items',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.hits({
          container,
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
    'with highlight function',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.hits({
          container,
          templates: {
            item(hit, { components }) {
              return components.Highlight({
                attribute: 'name',
                hit,
              });
            },
          },
        }),
      ]);
    })
  )
  .add(
    'with reverseHighlight function',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.hits({
          container,
          templates: {
            item(hit, { components }) {
              return components.ReverseHighlight({
                attribute: 'name',
                hit,
              });
            },
          },
        }),
      ]);
    })
  )
  .add(
    'with snippet function',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.configure({
          attributesToSnippet: ['name', 'description'],
        }),
      ]);

      search.addWidgets([
        instantsearch.widgets.hits({
          container,
          templates: {
            item(hit, { html, components }) {
              return html`
                <h4>
                  ${components.Snippet({
                    attribute: 'name',
                    hit,
                  })}
                </h4>
                <p>
                  ${components.Snippet({
                    attribute: 'description',
                    hit,
                  })}
                </p>
              `;
            },
          },
        }),
      ]);
    })
  )
  .add(
    'with reverseSnippet function',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.configure({
          attributesToSnippet: ['name', 'description'],
        }),
      ]);

      search.addWidgets([
        instantsearch.widgets.hits({
          container,
          templates: {
            item(hit) {
              return `
                <h4>${instantsearch.reverseSnippet({
                  attribute: 'name',
                  hit,
                })}</h4>
                <p>${instantsearch.reverseSnippet({
                  attribute: 'description',
                  hit,
                })}</p>
              `;
            },
          },
        }),
      ]);
    })
  )
  .add(
    'with insights function',
    withHits(
      ({ search, container, instantsearch }) => {
        search.addWidgets([
          instantsearch.widgets.configure({
            attributesToSnippet: ['name', 'description'],
            clickAnalytics: true,
          }),
        ]);

        search.addWidgets([
          instantsearch.widgets.hits({
            container,
            templates: {
              item: (item, { html, sendEvent }) => html`
                <h4>${item.name}</h4>
                <button
                  onClick=${() => sendEvent('click', [item], 'Add to cart')}
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
  );
