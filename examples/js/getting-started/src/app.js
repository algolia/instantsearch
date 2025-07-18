import { liteClient as algoliasearch } from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import { autocomplete } from 'instantsearch.js/es/widgets';

import 'instantsearch.css/themes/satellite.css';

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
  autocomplete({
    container: '#searchbox',
    translations: {
      placeholder: 'Search for products',
    },
    cssClasses: {
      root: 'aa-Root',
      input: 'aa-Input',
      panel: 'aa-Panel',
      list: 'aa-List',
      item: 'aa-Item',
      itemContent: 'aa-ItemContent',
      itemActionButton: 'aa-ItemActionButton',
    },
    templates: {
      item({ item }, { html }) {
        return html`<div>${item}</div>`;
      },
      panel({ querySuggestions, Item }, { html }) {
        return html`
          <div class="aa-PanelLayout">
            <section class="aa-Source">
              <ul class="aa-List">
                ${querySuggestions.map(
                  (item) =>
                    html`<li class="aa-Item"><${Item} item=${item} /></li>`
                )}
              </ul>
            </section>
          </div>
        `;
      },
    },
  }),
]);

search.start();
