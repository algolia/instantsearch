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
search.addWidget(customBreadcrumb());
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
  return () => ({
    init() {
      renderFn(
        {
          items: [],
          refine: () => {},
        },
        true
      );
    },

    render({ results, state }) {
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
      });
    },
  });
}
