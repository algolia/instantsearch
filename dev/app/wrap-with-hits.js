/* eslint-disable import/default */
import instantsearch from '../../index.js';

import item from './templates/item.html';
import empty from './templates/no-results.html';

export default (initWidget, opts = {}) => container => {
  window.search = instantsearch({
    appId: 'latency',
    apiKey: '6be0576ff61c053d5f9a3225e2a90f76',
    indexName: 'instant_search',
    searchParameters: { hitsPerPage: 3, ...(opts.searchParameters || {}) },
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
      maxPages: 20,
    })
  );

  initWidget(window.document.getElementById('widget-display'));
  window.search.start();
};
