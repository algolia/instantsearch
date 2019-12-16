import { storiesOf } from '@storybook/html';
import { action } from '@storybook/addon-actions';
import { withHits } from '../.storybook/decorators';
import insights from '../src/helpers/insights';

storiesOf('Results|Hits', module)
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
          transformItems: items =>
            items.map(item => ({
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
            item(hit) {
              return instantsearch.highlight({
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
    'with highlight helper',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.hits({
          container,
          templates: {
            item:
              '{{#helpers.highlight}}{ "attribute": "name" }{{/helpers.highlight}}',
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
            item(hit) {
              return `
                <h4>${instantsearch.snippet({
                  attribute: 'name',
                  hit,
                })}</h4>
                <p>${instantsearch.snippet({
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
    'with snippet helper',
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
            item: `
              <h4>{{#helpers.snippet}}{ "attribute": "name", "highlightedTagName": "mark" }{{/helpers.snippet}}</h4>
              <p>{{#helpers.snippet}}{ "attribute": "description", "highlightedTagName": "mark" }{{/helpers.snippet}}</p>`,
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
              item: item => `
          <h4>${item.name}</h4>
          <button
            ${insights('clickedObjectIDsAfterSearch', {
              objectIDs: [item.objectID],
              eventName: 'Add to cart',
            })} >Add to cart</button>
          `,
            },
          }),
        ]);
      },
      {
        insightsClient: (method, payload) =>
          action(`[InsightsClient] sent ${method} with payload`)(payload),
      }
    )
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
          instantsearch.widgets.hits({
            container,
            templates: {
              item: `
              <h4>{{name}}</h4>
              <button {{#helpers.insights}} {
               "method": "clickedObjectIDsAfterSearch", 
               "payload": { "eventName": "Add to cart" }
              } {{/helpers.insights}}>
                Add to cart
              </button>`,
            },
          }),
        ]);
      },
      {
        insightsClient: (method, payload) =>
          action(`[InsightsClient] sent ${method} with payload`)(payload),
      }
    )
  );
