/* eslint-disable import/default */

import { action } from 'dev-novel';
import algoliasearch from 'algoliasearch/lite';
import instantsearch from '../../../index.js';
import item from './item.html';
import empty from './no-results.html';

export const wrapWithHits = (
  initWidget,
  instantSearchConfig = {}
) => container => {
  const {
    indexName = 'instant_search',
    searchClient = algoliasearch('latency', '6be0576ff61c053d5f9a3225e2a90f76'),
    searchParameters = {},
    ...otherInstantSearchConfig
  } = instantSearchConfig;

  const urlLogger = action('Routing state');
  window.search = instantsearch({
    indexName,
    searchClient,
    searchParameters: {
      hitsPerPage: 3,
      ...searchParameters,
    },
    routing: {
      router: {
        write: routeState => {
          urlLogger(JSON.stringify(routeState, null, 2));
        },
        read: () => ({}),
        createURL: () => '',
        onUpdate: () => {},
      },
    },
    ...otherInstantSearchConfig,
  });

  container.innerHTML = `
    <div id="widget-display"></div>
    <div id="results-display">
      <div id="results-search-box-container"></div>
      <div id="results-hits-container"></div>
      <div id="results-pagination-container"></div>
    </div>
  `;

  window.search.addWidget(
    instantsearch.widgets.searchBox({
      container: '#results-search-box-container',
      placeholder: 'Search into our furnitures',
      poweredBy: false,
      autofocus: false,
    })
  );

  window.search.addWidget(
    instantsearch.widgets.hits({
      container: '#results-hits-container',
      templates: {
        empty,
        item,
      },
    })
  );

  window.search.addWidget(
    instantsearch.widgets.pagination({
      container: '#results-pagination-container',
      totalPages: 20,
    })
  );

  if (initWidget.length === 1) {
    initWidget(window.document.getElementById('widget-display'));

    return window.search.start();
  }

  return initWidget(window.document.getElementById('widget-display'), () => {
    window.search.start();
  });
};
