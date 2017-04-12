import {checkRendering} from '../../lib/utils.js';

const usage = `Usage:
var customMenu = connectMenu(function render(params, isFirstRendering) {
  // params = {
  //   items,
  //   state,
  //   createURL,
  //   refine,
  //   helper,
  //   instantSearchInstance,
  //   canRefine,
  //   widgetParams,
  //   currentRefinement,
  // }
});
search.addWidget(
  customMenu({
    attributeName,
    [ limit ],
    [ sortBy = ['isRefined', 'count:desc'] ]
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectMenu.html
`;

/**
 * @typedef {Object} CustomMenuWidgetOptions
 * @property {string} attributeName Name of the attribute for faceting (eg. "free_shipping")
 * @property {number} [limit = 10] How many facets values to retrieve [*]
 * @property {string[]|function} [sortBy = ['isRefined', 'count:desc']] How to sort refinements. Possible values: `count|isRefined|name:asc|name:desc`.
 *   You can also use a sort function that behaves like the standard Javascript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax). [*]
 */

/**
 * @typedef {Object} MenuRenderingOptions
 * @property {Object[]} items the elements that can be refined for the current search results
 * @property {function} createURL creates the URL for a single item name in the list
 * @property {function} refine filter the search to item.name value
 * @property {boolean} canRefine true if refinement can be applied
 * @property {Object} widgetParams all original options forwarded to rendering
 * @property {InstantSearch} instantSearchInstance the instance of instantsearch on which the widget is attached
 * @property {Object} currentRefinement the refinement currently applied
 */

 /**
  * Connects a rendering function with the menu business logic.
  * @type {Connector}
  * @param {function(MenuRenderingOptions, boolean)} renderFn function that renders the menu widget
  * @return {function(CustomMenuWidgetOptions):Widget} a widget factory for menu widget
  * @example
  * import instantsearch from '../../../../index.js';
  * 
  * export default instantsearch.connectors.connectMenu(customMenuRendering);
  * function customMenuRendering(opts, isFirstRendering) {
  *   const container = opts.widgetParams.containerNode;
  * 
  *   let input;
  *   if (isFirstRendering) {
  *     input = $('<select></select>');
  *     input.refine = opts.refine;
  *     input.on('change', e => {
  *       input.refine(e.target.value);
  *     });
  *     container.html('<div class="ais-toggle--header facet-title ais-header">Custom categories</div>')
  *              .append(input);
  *   } else {
  *     input = container.find('select');
  *   }
  * 
  *   input.refine = opts.refine;
  * 
  *   const facetValues = opts.items.slice(0, opts.widgetParams.limit || 10);
  *   const facetOptions = facetValues.map(f => f.isRefined ?
  *       $(`<option value='${f.path}' selected>${f.name}</option>`) :
  *       $(`<option value='${f.path}'>${f.name}</option>`)
  *   );
  *   const isValueSelected = facetValues.find(f => f.isRefined);
  * 
  *   const noValue = $(`<option value='' selected='${!isValueSelected}'></option>`);
  * 
  *   input.html('');
  * 
  *   input.append(noValue);
  *   if (facetOptions.length > 0) {
  *     facetOptions.forEach(o => {
  *       input.append(o);
  *     });
  *   }
  * }
  *
  */
export default function connectMenu(renderFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const {
      attributeName,
      limit = 10,
      sortBy = ['isRefined', 'count:desc'],
    } = widgetParams;

    if (!attributeName) {
      throw new Error(usage);
    }

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

        this._helper = helper;

        renderFn({
          items: [],
          createURL: this._createURL,
          refine: this._refine,
          instantSearchInstance,
          canRefine: false,
          widgetParams,
          currentRefinement: null,
        }, true);
      },

      render({results, instantSearchInstance}) {
        const items = results.getFacetValues(attributeName, {sortBy}).data || [];

        renderFn({
          items,
          createURL: this._createURL,
          refine: this._refine,
          instantSearchInstance,
          canRefine: items.length > 0,
          widgetParams,
          currentRefinement: items.find(({isRefined}) => isRefined),
        }, false);
      },
    };
  };
}
