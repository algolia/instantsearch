import {
  configure,
  hits,
  pagination,
  panel,
  refinementList,
  searchBox,
  frequentlyBoughtTogether,
} from 'instantsearch.js/es/widgets';

import { search } from './search';
import { hitItem, recommendItem } from './templates';

search.addWidgets([
  configure({
    hitsPerPage: 8,
  }),
  searchBox({
    container: '#searchbox',
  }),
  hits({
    container: '#hits',
    cssClasses: { list: 'grid gap-2 grid-cols-3' },
    templates: {
      item: (hit, { html, components }) => hitItem({ hit, html, components }),
    },
  }),
  panel({
    templates: { header: (_, { html }) => html`Brand` },
  })(refinementList)({
    container: '#brand-list',
    attribute: 'brand',
  }),
  pagination({
    container: '#pagination',
  }),
  frequentlyBoughtTogether({
    container: '#fbt',
    objectIDs: ['M0E20000000EAAK'],
    cssClasses: { list: 'grid gap-2 grid-cols-3 lg:grid-cols-6' },
    templates: {
      item: ({ item, html, sendEvent }) => {
        return recommendItem({
          item,
          html,
          onAddToCart() {
            sendEvent('conversion', item, 'Added To Cart', {
              eventSubtype: 'addToCart',
              objectData: [
                {
                  discount: 0,
                  price: item.price.value,
                  quantity: 1,
                },
              ],
              value: item.price.value,
              currency: item.price.currency,
            });
          },
        });
      },
    },
  }),
  frequentlyBoughtTogether({
    container: '#fbt2',
    objectIDs: ['M0E20000000E1HU'],
    cssClasses: { list: 'grid gap-2 grid-cols-3 lg:grid-cols-6' },
    templates: {
      item: ({ item, html, sendEvent }) => {
        return recommendItem({
          item,
          html,
          onAddToCart() {
            sendEvent('conversion', item, 'Added To Cart', {
              eventSubtype: 'addToCart',
              objectData: [
                {
                  discount: 0,
                  price: item.price.value,
                  quantity: 1,
                },
              ],
              value: item.price.value,
              currency: item.price.currency,
            });
          },
        });
      },
    },
  }),
]);

search.start();
