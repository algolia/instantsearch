import {
  configure,
  hits,
  frequentlyBoughtTogether,
} from 'instantsearch.js/es/widgets';

const searchParams = new URLSearchParams(window.location.search);
const objectID = searchParams.get('pid');

import { search } from './search';
import { hitItem, recommendItem } from './templates';

search.addWidgets([
  configure({
    hitsPerPage: 8,
    filters: `objectID:${objectID}`,
  }),
  hits({
    container: '#hits',
    cssClasses: { root: 'ais-Hits--product', list: 'grid gap-2' },
    templates: {
      item: (hit, { html, components }) => hitItem({ hit, html, components }),
    },
  }),
  frequentlyBoughtTogether({
    container: '#fbt',
    objectIDs: [objectID],
    cssClasses: { list: 'grid gap-2 grid-cols-3' },
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
