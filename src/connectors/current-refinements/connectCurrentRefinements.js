import isArray from 'lodash/isArray';
import isPlainObject from 'lodash/isPlainObject';
import {
  getRefinements,
  clearRefinements,
  checkRendering,
} from '../../lib/utils.js';

const usage = `Usage:
var customCurrentRefinements = connectCurrentRefinements(function renderFn(params, isFirstRendering) {
  // params = {
  //   attributes,
  //   refine,
  //   createURL,
  //   refinements,
  //   instantSearchInstance,
  //   widgetParams,
  // }
});
search.addWidget(
  customCurrentRefinements({
    [ includedAttributes ],
    [ excludedAttributes = [] ],
    [ includesQuery = false ],
    [ transformItems ],
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/v2/connectors/connectCurrentRefinements.html
`;

/**
 * @typedef {Object} CurrentRefinement
 * @property {"facet"|"exclude"|"disjunctive"|"hierarchical"|"numeric"|"query"} type Type of refinement
 * @property {string} attributeName Attribute on which the refinement is applied
 * @property {string} name value of the refinement
 * @property {number} [numericValue] value if the attribute is numeric and used with a numeric filter
 * @property {boolean} [exhaustive] `true` if the count is exhaustive, only if applicable
 * @property {number} [count] number of items found, if applicable
 * @property {string} [query] value of the query if the type is query
 */

/**
 * @typedef {Object} CurrentRefinementsRenderingOptions
 * @property {Object.<string, object>} includedAttributes Original `CurrentRefinementsWidgetOptions.includedAttributes` mapped by keys.
 * @property {Object.<string, object>} excludedAttributes Label definitions for the different filters to exclude.
 * @property {function(item)} refine Clears a single refinement.
 * @property {function(item): string} createURL Creates an individual url where a single refinement is cleared.
 * @property {CurrentRefinement[]} refinements All the current refinements.
 * @property {Object} widgetParams All original `CustomCurrentRefinementsWidgetOptions` forwarded to the `renderFn`.
 */

/**
 * @typedef {Object} CurrentRefinementsAttributes
 * @property {string} name Mandatory field which is the name of the attribute.
 * @property {string} label The label to apply on a refinement per attribute.
 */

/**
 * @typedef {Object} CustomCurrentRefinementsWidgetOptions
 * @property {CurrentRefinementsAttributes[]} [includedAttributes] Specification for the display of
 * refinements per attribute (default: `[]`). By default, the widget will display all the filters
 * set with no special treatment for the label.
 * @property {string[]} [excludedAttributes = []] Label definitions for the different filters to exclude.
 * @property {boolean} [includesQuery = false] Whether to add the query as a refinement.
 * @property {function(object[]):object[]} [transformItems] Function to transform the items passed to the templates.
 */

/**
 * **CurrentRefinements** connector provides the logic to build a widget that will give
 * the user the ability to see all the currently applied filters and, remove some or all of
 * them.
 *
 * This provides a `refine(item)` function to remove a selected refinement.
 * Those functions can see their behaviour change based on the widget options used.
 * @type {Connector}
 * @param {function(CurrentRefinementsRenderingOptions)} renderFn Rendering function for the custom **CurrentRefinements** widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
 * @return {function(CustomCurrentRefinementsWidgetOptions)} Re-usable widget factory for a custom **CurrentRefinements** widget.
 * @example
 * // custom `renderFn` to render the custom ClearRefinements widget
 * function renderFn(CurrentRefinementsRenderingOptions, isFirstRendering) {
 *   var containerNode = CurrentRefinementsRenderingOptions.widgetParams.containerNode;
 *   if (isFirstRendering) {
 *     containerNode
 *       .html('<ul id="refinements"></ul><div id="cta-container"></div>');
 *   }
 *
 *   containerNode
 *     .find('#cta-container > a')
 *     .off('click');
 *
 *   containerNode
 *     .find('li > a')
 *     .each(function() { $(this).off('click') });
 *
 *   if (CurrentRefinementsRenderingOptions.refinements
 *       && CurrentRefinementsRenderingOptions.refinements.length > 0) {
 *     var list = CurrentRefinementsRenderingOptions.refinements.map(function(refinement) {
 *       return '<li><a href="' + CurrentRefinementsRenderingOptions.createURL(refinement) + '">'
 *         + refinement.computedLabel + ' ' + refinement.count + '</a></li>';
 *     });
 *
 *     CurrentRefinementsRenderingOptions.find('ul').html(list);
 *     CurrentRefinementsRenderingOptions.find('li > a').each(function(index) {
 *       $(this).on('click', function(event) {
 *         event.preventDefault();
 *
 *         var refinement = CurrentRefinementsRenderingOptions.refinements[index];
 *         CurrentRefinementsRenderingOptions.refine(refinement);
 *       });
 *     });
 *   } else {
 *     containerNode.find('#cta-container').html('');
 *     containerNode.find('ul').html('');
 *   }
 * }
 *
 * // connect `renderFn` to CurrentRefinements logic
 * var customCurrentRefinements = instantsearch.connectors.connectCurrentRefinements(renderFn);
 *
 * // mount widget on the page
 * search.addWidget(
 *   customCurrentRefinements({
 *     containerNode: $('#custom-crv-container'),
 *   })
 * );
 */
export default function connectCurrentRefinements(renderFn, unmountFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const {
      includedAttributes = [],
      excludedAttributes = [],
      includesQuery = false,
      transformItems = items => items,
    } = widgetParams;

    const isUsageValid =
      isArray(includedAttributes) &&
      isArray(excludedAttributes) &&
      includedAttributes.reduce(
        (res, val) =>
          res &&
          isPlainObject(val) &&
          typeof val.name === 'string' &&
          (!val.label || typeof val.label === 'string') &&
          (!val.template ||
            typeof val.template === 'string' ||
            typeof val.template === 'function') &&
          (!val.transformData || typeof val.transformData === 'function'),
        true
      );

    if (!isUsageValid) {
      throw new Error(usage);
    }

    const attributes = includedAttributes.filter(
      ({ name }) => excludedAttributes.indexOf(name) === -1
    );
    const attributeNames = attributes.map(attribute => attribute.name);
    const attributesObject = attributes.reduce(
      (res, attribute) => ({
        ...res,
        [attribute.name]: attribute,
      }),
      {}
    );

    return {
      init({ helper, createURL, instantSearchInstance }) {
        this._clearRefinementsAndSearch = () => {
          helper
            .setState(
              clearRefinements({
                helper,
                includedAttributes: attributes,
                clearsQuery: includesQuery,
              })
            )
            .search();
        };

        const refinements = transformItems(
          getFilteredRefinements({
            results: {},
            state: helper.state,
            attributeNames,
            excludedAttributes,
            includesQuery,
          })
        );

        const _createURL = refinement =>
          createURL(clearRefinementFromState(helper.state, refinement));
        const _clearRefinement = refinement =>
          clearRefinement(helper, refinement);

        renderFn(
          {
            attributes: attributesObject,
            refine: _clearRefinement,
            createURL: _createURL,
            refinements,
            instantSearchInstance,
            widgetParams,
          },
          true
        );
      },

      render({ results, helper, state, createURL, instantSearchInstance }) {
        const refinements = transformItems(
          getFilteredRefinements({
            results,
            state,
            attributeNames,
            excludedAttributes,
            includesQuery,
          })
        );

        const _createURL = refinement =>
          createURL(clearRefinementFromState(helper.state, refinement));
        const _clearRefinement = refinement =>
          clearRefinement(helper, refinement);

        renderFn(
          {
            attributes: attributesObject,
            refine: _clearRefinement,
            createURL: _createURL,
            refinements,
            instantSearchInstance,
            widgetParams,
          },
          false
        );
      },

      dispose() {
        unmountFn();
      },
    };
  };
}

function getRestrictedIndexForSort(
  attributeNames,
  otherAttributeNames,
  attributeName
) {
  const idx = attributeNames.indexOf(attributeName);
  if (idx !== -1) {
    return idx;
  }
  return attributeNames.length + otherAttributeNames.indexOf(attributeName);
}

function compareRefinements(attributeNames, otherAttributeNames, a, b) {
  const idxa = getRestrictedIndexForSort(
    attributeNames,
    otherAttributeNames,
    a.attributeName
  );
  const idxb = getRestrictedIndexForSort(
    attributeNames,
    otherAttributeNames,
    b.attributeName
  );
  if (idxa === idxb) {
    if (a.name === b.name) {
      return 0;
    }
    return a.name < b.name ? -1 : 1;
  }
  return idxa < idxb ? -1 : 1;
}

function getFilteredRefinements({
  results,
  state,
  attributeNames,
  excludedAttributes,
  includesQuery,
}) {
  const refinements = getRefinements(results, state, includesQuery)
    .filter(
      ({ attributeName }) =>
        attributeNames.length === 0 ||
        attributeNames.indexOf(attributeName) !== -1
    )
    .filter(
      ({ attributeName }) => excludedAttributes.indexOf(attributeName) === -1
    );

  const otherAttributeNames = refinements.reduce((res, refinement) => {
    if (
      attributeNames.indexOf(refinement.attributeName) === -1 &&
      res.indexOf(refinement.attributeName === -1)
    ) {
      res.push(refinement.attributeName);
    }
    return res;
  }, []);

  const filteredRefinements = refinements
    .sort(compareRefinements.bind(null, attributeNames, otherAttributeNames))
    .map(normalizeItem);

  return filteredRefinements;
}

function clearRefinementFromState(state, refinement) {
  switch (refinement.type) {
    case 'facet':
      return state.removeFacetRefinement(
        refinement.attributeName,
        refinement.name
      );
    case 'disjunctive':
      return state.removeDisjunctiveFacetRefinement(
        refinement.attributeName,
        refinement.name
      );
    case 'hierarchical':
      return state.clearRefinements(refinement.attributeName);
    case 'exclude':
      return state.removeExcludeRefinement(
        refinement.attributeName,
        refinement.name
      );
    case 'numeric':
      return state.removeNumericRefinement(
        refinement.attributeName,
        refinement.operator,
        refinement.numericValue
      );
    case 'tag':
      return state.removeTagRefinement(refinement.name);
    case 'query':
      return state.setQueryParameter('query', '');
    default:
      throw new Error(
        `clearRefinement: type ${refinement.type} is not handled`
      );
  }
}

function clearRefinement(helper, refinement) {
  helper.setState(clearRefinementFromState(helper.state, refinement)).search();
}

function getOperatorSymbol(operator) {
  switch (operator) {
    case '>=':
      return '≥';
    case '<=':
      return '≤';
    default:
      return '';
  }
}

function normalizeItem(item) {
  const attributeName = item.type === 'query' ? 'query' : item.attributeName;
  const computedLabel = item.operator
    ? `${getOperatorSymbol(item.operator)} ${item.name}`
    : item.name;

  return {
    ...item,
    attributeName,
    computedLabel,
  };
}
