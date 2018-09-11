/* eslint-disable import/default */

import { action, storiesOf } from 'dev-novel';

import instantsearch from '../../../../index.js';
import { wrapWithHitsAndJquery } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('Autocomplete');

// Widget to search into brands, select one and set it as query
const autocompleteBrands = instantsearch.connectors.connectAutocomplete(
  ({ indices, refine, widgetParams: { containerNode } }, isFirstRendering) => {
    if (isFirstRendering) {
      containerNode.html(`
      <strong>Search for a brand:</strong>
      <select id="ais-autocomplete"></select>
    `);

      containerNode.find('select').selectize({
        options: [],

        valueField: 'brand',
        labelField: 'brand',
        searchField: 'brand',

        highlight: false,

        onType: refine,

        onChange: refine,
      });
    }

    if (!isFirstRendering && indices[0].results) {
      const autocompleteInstance = containerNode.find('select')[0].selectize;

      indices[0].results.hits.forEach(h => autocompleteInstance.addOption(h));
      autocompleteInstance.refreshOptions(autocompleteInstance.isOpen);
    }
  }
);

// widget to search into hits, select a choice open a new page (event example)
const autocompleteAndSelect = instantsearch.connectors.connectAutocomplete(
  ({ indices, refine, widgetParams: { containerNode } }, isFirstRendering) => {
    const onItemSelected = objectID => {
      const item = indices.reduce((match, index) => {
        if (match) return match;
        return index.hits.find(obj => obj.objectID === objectID);
      }, null);

      action('item:selected')(item);
    };

    if (isFirstRendering) {
      containerNode.html(`
        <strong>Search for anything:</strong>
        <select id="ais-autocomplete"></select>
      `);

      containerNode.find('select').selectize({
        options: [],

        valueField: 'objectID',
        labelField: 'name',
        searchField: ['name', 'brand', 'categories', 'description'],

        render: {
          option: item => `
            <div class="hit">
              <div class="hit-picture">
                <img src="${item.image}" />
              </div>

              <div class="hit-content">
                <div>
                  <span>${item._highlightResult.name.value}</span>
                  <span>${item.price_formatted}</span>
                  <span>${item.rating} stars</span>
                </div>

                <div class="hit-type">
                  ${item._highlightResult.type.value}
                </div>

                <div class="hit-description">
                  ${item._highlightResult.description.value}
                </div>
              </div>
            </div>
          `,
        },

        highlight: false,
        onType: refine,

        onChange: onItemSelected,
      });

      // HACK: bind `autocompleteInstance.search` with an empty query so it returns
      // all the hits sent by Algolia
      const autocompleteInstance = containerNode.find('select')[0].selectize;
      autocompleteInstance.search.bind(autocompleteInstance, '');
    }

    if (!isFirstRendering && indices[0].results) {
      const autocompleteInstance = containerNode.find('select')[0].selectize;

      // first clear options
      autocompleteInstance.clearOptions();
      // add new ones
      indices[0].results.hits.forEach(h => autocompleteInstance.addOption(h));
      // refresh the view
      autocompleteInstance.refreshOptions(autocompleteInstance.isOpen);
    }
  }
);

const multiIndex = instantsearch.connectors.connectAutocomplete(
  (
    { indices, currentRefinement, widgetParams: { containerNode } },
    isFirstRendering
  ) => {
    if (isFirstRendering) {
      containerNode.append(`
          <div style="width: 100%">
          <div
            id="hits0"
            style="width: 45%; margin-right: 5%; float: left;"
          >
          </div>

          <div
            id="hits1"
            style="width: 50%; float: right"
          >
          </div>

          <div style="clear: both;"></div>
        </div>
      `);
    }

    // display hits
    indices.forEach(({ hits }, index) => {
      const hitsHTML =
        hits.length === 0
          ? `No results for query <em>${currentRefinement}</em>`
          : hits.map(
              hit => `
            <div class="hit">
              <div class="hit-picture">
                <img src="${hit.image}" />
              </div>

              <div class="hit-content">
                <div>
                  <span>${hit._highlightResult.name.value}</span>
                </div>

                <div class="hit-type">
                  ${hit._highlightResult.type.value}
                </div>
              </div>
            </div>
          `
            );

      containerNode.find(`#hits${index}`).html(hitsHTML);
    });
  }
);

export default () => {
  stories
    .add(
      'default',
      wrapWithHitsAndJquery(containerNode => {
        window.search.addWidget(autocompleteBrands({ containerNode }));
      })
    )
    .add(
      'Autcomplete into hits',
      wrapWithHitsAndJquery(containerNode =>
        window.search.addWidget(autocompleteAndSelect({ containerNode }))
      )
    )
    .add(
      'Multi index',
      wrapWithHitsAndJquery(containerNode => {
        containerNode.append('<div id="multi-index-search-box"></div>');
        window.search.addWidget(
          instantsearch.widgets.searchBox({
            container: '#multi-index-search-box',
            placeholder: 'Search into the two indices',
            poweredBy: false,
            autofocus: false,
          })
        );
        window.search.addWidget(
          multiIndex({
            containerNode,
            indices: [{ label: 'bestbuy', value: 'bestbuy' }],
          })
        );
      })
    );
};
