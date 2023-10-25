const { algoliasearch, instantsearch } = window;

const searchClient = algoliasearch('latency', '6be0576ff61c053d5f9a3225e2a90f76');

const search = instantsearch({
  indexName: 'instant_search',
  searchClient,
  future: { preserveSharedStateOnUnmount: true },
  
});


search.addWidgets([
  instantsearch.widgets.searchBox({
    container: '#searchbox',
  }),
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      item: (hit, { html, components }) => html`
<article>
  <h1>${components.Highlight({hit, attribute: "name"})}</h1>
  <p>${components.Highlight({hit, attribute: "description"})}</p>
</article>
`,
    },
  }),
  instantsearch.widgets.configure({
    hitsPerPage: 8,
  }),
  instantsearch.widgets.panel({
    templates: { header: () => 'brand' },
  })(instantsearch.widgets.refinementList)({
    container: '#brand-list',
    attribute: 'brand',
  }),
  instantsearch.widgets.pagination({
    container: '#pagination',
  }),
]);

search.start();

