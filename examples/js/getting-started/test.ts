import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import { hits } from 'instantsearch.js/es/widgets';

interface ProductSearchHit {
  Name: string;
}

const config = {
  indexName: 'instant_search',
  appID: '',
  apiKey: '',
};

instantsearch({
  indexName: config.indexName,
  searchClient: algoliasearch(config.appID, config.apiKey),
}).addWidgets([
  hits<ProductSearchHit>({
    container: '#id',
    transformItems: (items) => {
      return items.map((item) => {
        return {
          ...item,
          Name: item.Name.toUpperCase(),
        };
      });
    },
    templates: {
      item: (hit, { html }) => {
        return html`<div>results: ${hit.Name}</div>`;
      },
    },
  }),
]);
