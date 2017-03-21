import {checkRendering} from '../../lib/utils.js';

const usage = `Usage:
var customMenu = connectMenu(function render(params, isFirstRendering) {
  // params = {
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
    checkUsage({attributeName, usageMessage: usage});

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
        this._createURL = facetValue =>
          createURL(helper.state.toggleRefinement(attributeName, facetValue));

        this._refine = facetValue => helper
          .toggleRefinement(attributeName, facetValue)
          .search();

        this._instantSearchInstance = instantSearchInstance;
        this._helper = helper;

        renderFn({
          items: [],
          state: helper.state,
          createURL: this._createURL,
          refine: this._refine,
          helper: this._helper,
          isFirstSearch: true,
          instantSearchInstance,
          canRefine: false,
        }, true);
      },

      render({results, state}) {
        const items = results.getFacetValues(attributeName, {sortBy}).data || [];

        renderFn({
          items,
          state,
          createURL: this._createURL,
          refine: this._refine,
          helper: this._helper,
          isFirstSearch: false,
          instantSearchInstance: this._instantSearchInstance,
          canRefine: items.length > 0,
        }, false);
      },
    };
  };
}
