/* global algoliasearch instantsearch */

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

window.search = instantsearch({
  indexName: 'instant_search',
  searchClient,
  routing: true,
});

window.search.addWidgets([
  instantsearch.widgets.currentRefinements({
    container: '#current-refinements',
  }),
  instantsearch.widgets.searchBox({
    container: '#searchbox',
  }),
  instantsearch.widgets.refinementList({
    container: '#refinement-list',
    attribute: 'brand',
  }),
  instantsearch.widgets.rangeInput({
    container: '#range',
    attribute: 'price',
  }),
  instantsearch.widgets.toggleRefinement({
    container: '#toggle',
    attribute: 'free_shipping',
  }),
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      item: (hit, { html, components }) =>
        html`<div>${components.Highlight({ hit, attribute: 'name' })}</div>`,
    },
  }),
  instantsearch.widgets.pagination({
    container: '#pagination',
  }),
]);
