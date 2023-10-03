import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import {
  configure,
  hierarchicalMenu,
  hits,
  index,
  panel,
  searchBox,
} from 'instantsearch.js/es/widgets';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const search = instantsearch({
  indexName: 'instant_search',
  searchClient,
  insights: true,
});

search.addWidgets([
  searchBox({
    container: '#searchbox',
  }),
  index({ indexName: 'instant_search', indexId: 'sendEvent' }).addWidgets([
    configure({
      filters: 'brand:Apple',
    }),
    hits({
      container: '#hits-sendevent',
      templates: {
        item: (hit, { html, components, sendEvent }) => html`
          <article>
            <h1>${components.Highlight({ hit, attribute: 'name' })}</h1>
            <p>${components.Highlight({ hit, attribute: 'description' })}</p>
            <p>$${hit.price}</p>
            <button
              type="button"
              onClick=${() =>
                sendEvent('conversion', hit, 'Add to cart', {
                  eventSubtype: 'addToCart',
                  objectData: [
                    {
                      queryId: hit.__queryID,
                      price: hit.price,
                      discount: 0,
                      quantity: 1,
                    },
                  ],
                  value: hit.price,
                  currency: 'USD',
                })}
            >
              Add to cart
            </button>
            ${' • '}
            <button
              type="button"
              onClick=${() =>
                sendEvent('conversion', hit, 'Buy product', {
                  eventSubtype: 'purchase',
                  objectData: [
                    {
                      queryId: hit.__queryID,
                      price: hit.price,
                      discount: 0,
                      quantity: 1,
                    },
                  ],
                  value: hit.price,
                  currency: 'USD',
                })}
            >
              Buy now
            </button>
          </article>
        `,
      },
    }),
  ]),
  index({ indexName: 'instant_search', indexId: 'bindEvent' }).addWidgets([
    configure({
      filters: 'brand:Samsung',
    }),
    hits({
      container: '#hits-bindevent',
      templates: {
        item(hit, bindEvent) {
          return `<article>
          <h1>${instantsearch.highlight({ hit, attribute: 'name' })}</h1>
          <p>${instantsearch.highlight({ hit, attribute: 'description' })}</p>
          <p>$${hit.price}</p>
          <button
          type="button"
          ${bindEvent('conversion', hit, 'Add to cart', {
            eventSubtype: 'addToCart',
            objectData: [
              {
                queryId: hit.__queryID,
                price: hit.price,
                discount: 0,
                quantity: 1,
              },
            ],
            value: hit.price,
            currency: 'USD',
          })}
        >
          Add to cart
        </button>
        ${' • '}
        <button
          type="button"
          ${bindEvent('conversion', hit, 'Buy product', {
            eventSubtype: 'purchase',
            objectData: [
              {
                queryId: hit.__queryID,
                price: hit.price,
                discount: 0,
                quantity: 1,
              },
            ],
            value: hit.price,
            currency: 'USD',
          })}
        >
          Buy now
        </button>
        </article>`;
        },
      },
    }),
  ]),
  configure({
    hitsPerPage: 2,
  }),
  panel({
    templates: { header: 'Category' },
  })(hierarchicalMenu)({
    container: '#category',
    attributes: ['hierarchicalCategories.lvl0', 'hierarchicalCategories.lvl1'],
  }),
]);

search.start();
