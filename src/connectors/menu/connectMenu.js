import {checkRendering} from '../../lib/utils.js';

const usage = `Usage:
var customMenu = connectMenu(function render(params) {
  // params = {
  //   isFirstRender,
  //   isFromSearch,
  //   createURL,
  //   items,
  //   refine,
  //   instantSearchInstance,
  //   canRefine,
  // }
});
search.addWidget(
  customMenu({
    attributeName,
    [ limit ],
    [ sortBy = ['count:desc', 'name:asc'] ]
  });
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectMenu.html
`;

export const checkUsage = ({attributeName, usageMessage}) => {
  const noAttributeName = attributeName === undefined;

  if (noAttributeName) {
    throw new Error(usageMessage);
  }
};

export default function connectMenu(renderFn) {
  checkRendering(renderFn, usage);

  return ({
    attributeName,
    limit = 10,
    sortBy = ['count:desc', 'name:asc'],
  }) => {
    checkUsage({attributeName, usage});

    const render = ({
      items,
      state,
      createURL,
      refine,
      helper,
      isFromSearch,
      isFirstSearch,
      instantSearchInstance,
      isFirstRendering,
    }) => {
      const _createURL = facetValue => createURL(state.toggleRefinement(attributeName, facetValue));

      renderFn({
        createURL: _createURL,
        items,
        refine,
        instantSearchInstance,
        canRefine: items.length > 0,
        isFirstSearch,
        helper,
        isFromSearch,
        limit,
        isFirstRendering,
      });
    };

    let _refine;
    let _helper;
    let _instantSearchInstance;

    return {
      getConfiguration(configuration) {
        const widgetConfiguration = {
          hierarchicalFacets: [{
            name: attributeName,
            attributes: [attributeName],
          }],
        };

        const currentMaxValuesPerFacet = configuration.maxValuesPerFacet || 0;
        widgetConfiguration.maxValuesPerFacet = Math.max(currentMaxValuesPerFacet, limit);

        return widgetConfiguration;
      },

      init({helper, createURL, instantSearchInstance}) {
        _refine = facetValue => helper
          .toggleRefinement(attributeName, facetValue)
          .search();

        _instantSearchInstance = instantSearchInstance;
        _helper = helper;

        render({
          items: [],
          state: helper.state,
          createURL,
          refine: _refine,
          helper: _helper,
          isFirstSearch: true,
          isFirstRendering: true,
          instantSearchInstance,
        });
      },

      render({results, state, createURL}) {
        const items = results.getFacetValues(attributeName, {sortBy}).data || [];

        render({
          items,
          state,
          createURL,
          refine: _refine,
          helper: _helper,
          isFirstSearch: false,
          isFirstRendering: false,
          instantSearchInstance: _instantSearchInstance,
        });
      },
    };
  };
}
