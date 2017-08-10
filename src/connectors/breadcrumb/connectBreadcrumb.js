const usage = `Usage:
var customBreadcrumb = connectBreadcrumb(function renderFn(params, isFirstRendering) {
  // params = {
  //   items,
  //   refine,
  //   separator,
  //   rootURL,
  //   transformData,
  //   instantSearchInstance,
  //   widgetParams,
  // }
});
search.addWidget(
  customBreadcrumb({
    [ separator = ' > ' ],
    [ rootURL = null ],
    [ transformData ]
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectBreadcrumb.html
`;

function prepareItems(obj) {
  return obj.data.reduce((result, currentItem) => {
    if (currentItem.isRefined) {
      result.push({
        name: currentItem.name,
        value: currentItem.path,
        count: currentItem.count,
      });
      if (Array.isArray(currentItem.data)) {
        const children = prepareItems(currentItem);
        result = result.concat(children);
      }
    }
    return result;
  }, []);
}

export default function connectBreadcrumb(renderFn) {
  return ({ separator = '>', rootURL, transformData } = {}) => ({
    init() {
      renderFn({
        items: [],
        refine: () => {},
        separator,
        rootURL,
        transformData,
      });
    },

    render({ results, state }) {
      // 1. trouver le nom du facet hierarchical
      // 2. récupérer les "raw" items des search results (results.getFacetValues([nom facet hierarchical]))
      // 3. appliquer la function recursive sur ces items ()
      //
      // HINT: https://github.com/algolia/poc-walmart-mx/blob/7b2e3a14d6ce6419e2a6140a822a767a96f25c9a/sources/views/nested-list.jsx#L55-L56

      // const items = [];
      if (
        !state.hierarchicalFacets ||
        (Array.isArray(state.hierarchicalFacets) &&
          state.hierarchicalFacets.length === 0)
      ) {
        throw new Error(usage);
      }

      const [{ name: facetName }] = state.hierarchicalFacets;

      const facetsValues = results.getFacetValues(facetName);
      const items = prepareItems(facetsValues);

      renderFn({
        items,
        refine: () => {},
        separator,
        rootURL,
        transformData,
      });
    },
  });
}
