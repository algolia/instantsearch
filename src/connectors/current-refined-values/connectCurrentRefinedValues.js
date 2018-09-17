import isUndefined from 'lodash/isUndefined';
import isBoolean from 'lodash/isBoolean';
import isString from 'lodash/isString';
import isArray from 'lodash/isArray';
import isPlainObject from 'lodash/isPlainObject';
import isFunction from 'lodash/isFunction';
import isEmpty from 'lodash/isEmpty';

import map from 'lodash/map';
import reduce from 'lodash/reduce';
import filter from 'lodash/filter';

import {
  getRefinements,
  clearRefinements,
  checkRendering,
} from '../../lib/utils.js';

const usage = `Usage:
var customCurrentRefinedValues = connectCurrentRefinedValues(function renderFn(params, isFirstRendering) {
  // params = {
  //   attributes,
  //   clearAllClick,
  //   clearAllPosition,
  //   clearAllURL,
  //   refine,
  //   createURL,
  //   refinements,
  //   instantSearchInstance,
  //   widgetParams,
  // }
});
search.addWidget(
  customCurrentRefinedValues({
    [ attributes = [] ],
    [ onlyListedAttributes = false ],
    [ clearsQuery = false ],
    [ transformItems ],
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/v2/connectors/connectCurrentRefinedValues.html
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
 * @typedef {Object} CurrentRefinedValuesRenderingOptions
 * @property {Object.<string, object>} attributes Original `CurrentRefinedValuesWidgetOptions.attributes` mapped by keys.
 * @property {function} clearAllClick Clears all the currently refined values.
 * @property {function} clearAllURL Generate a URL which leads to a state where all the refinements have been cleared.
 * @property {function(item)} refine Clears a single refinement.
 * @property {function(item): string} createURL Creates an individual url where a single refinement is cleared.
 * @property {CurrentRefinement[]} refinements All the current refinements.
 * @property {Object} widgetParams All original `CustomCurrentRefinedValuesWidgetOptions` forwarded to the `renderFn`.
 */

/**
 * @typedef {Object} CurrentRefinedValuesAttributes
 * @property {string} name Mandatory field which is the name of the attribute.
 * @property {string} label The label to apply on a refinement per attribute.
 */

/**
 * @typedef {Object} CustomCurrentRefinedValuesWidgetOptions
 * @property {CurrentRefinedValuesAttributes[]} [attributes = []] Specification for the display of
 * refinements per attribute (default: `[]`). By default, the widget will display all the filters
 * set with no special treatment for the label.
 * @property {boolean} [onlyListedAttributes = false] Limit the displayed refinement to the list specified.
 * @property {boolean} [clearsQuery = false] Clears also the active search query when using clearAll.
 * @property {function(object[]):object[]} [transformItems] Function to transform the items passed to the templates.
 */

/**
 * **CurrentRefinedValues** connector provides the logic to build a widget that will give
 * the user the ability to see all the currently applied filters and, remove some or all of
 * them.
 *
 * This provides a `refine(item)` function to remove a selected refinement and a `clearAllClick`
 * function to clear all the filters. Those functions can see their behaviour change based on
 * the widget options used.
 * @type {Connector}
 * @param {function(CurrentRefinedValuesRenderingOptions)} renderFn Rendering function for the custom **CurrentRefinedValues** widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
 * @return {function(CustomCurrentRefinedValuesWidgetOptions)} Re-usable widget factory for a custom **CurrentRefinedValues** widget.
 * @example
 * // custom `renderFn` to render the custom ClearAll widget
 * function renderFn(CurrentRefinedValuesRenderingOptions, isFirstRendering) {
 *   var containerNode = CurrentRefinedValuesRenderingOptions.widgetParams.containerNode;
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
 *   if (CurrentRefinedValuesRenderingOptions.refinements
 *       && CurrentRefinedValuesRenderingOptions.refinements.length > 0) {
 *     containerNode
 *       .find('#cta-container')
 *       .html('<a href="' + CurrentRefinedValuesRenderingOptions.clearAllURL + '">Clear all </a>');
 *
 *     containerNode
 *       .find('#cta-container > a')
 *       .on('click', function(event) {
 *         event.preventDefault();
 *         CurrentRefinedValuesRenderingOptions.clearAllClick();
 *       });
 *
 *     var list = CurrentRefinedValuesRenderingOptions.refinements.map(function(refinement) {
 *       return '<li><a href="' + CurrentRefinedValuesRenderingOptions.createURL(refinement) + '">'
 *         + refinement.computedLabel + ' ' + refinement.count + '</a></li>';
 *     });
 *
 *     CurrentRefinedValuesRenderingOptions.find('ul').html(list);
 *     CurrentRefinedValuesRenderingOptions.find('li > a').each(function(index) {
 *       $(this).on('click', function(event) {
 *         event.preventDefault();
 *
 *         var refinement = CurrentRefinedValuesRenderingOptions.refinements[index];
 *         CurrentRefinedValuesRenderingOptions.refine(refinement);
 *       });
 *     });
 *   } else {
 *     containerNode.find('#cta-container').html('');
 *     containerNode.find('ul').html('');
 *   }
 * }
 *
 * // connect `renderFn` to CurrentRefinedValues logic
 * var customCurrentRefinedValues = instantsearch.connectors.connectCurrentRefinedValues(renderFn);
 *
 * // mount widget on the page
 * search.addWidget(
 *   customCurrentRefinedValues({
 *     containerNode: $('#custom-crv-container'),
 *   })
 * );
 */
export default function connectCurrentRefinedValues(renderFn, unmountFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const {
      attributes = [],
      onlyListedAttributes = false,
      clearsQuery = false,
      transformItems = items => items,
    } = widgetParams;

    const attributesOK =
      isArray(attributes) &&
      reduce(
        attributes,
        (res, val) =>
          res &&
          isPlainObject(val) &&
          isString(val.name) &&
          (isUndefined(val.label) || isString(val.label)) &&
          (isUndefined(val.template) ||
            isString(val.template) ||
            isFunction(val.template)) &&
          (isUndefined(val.transformData) || isFunction(val.transformData)),
        true
      );

    const showUsage =
      false ||
      !isArray(attributes) ||
      !attributesOK ||
      !isBoolean(onlyListedAttributes);

    if (showUsage) {
      throw new Error(usage);
    }

    const attributeNames = map(attributes, attribute => attribute.name);
    const restrictedTo = onlyListedAttributes ? attributeNames : undefined;

    const attributesObj = reduce(
      attributes,
      (res, attribute) => {
        res[attribute.name] = attribute;
        return res;
      },
      {}
    );

    return {
      init({ helper, createURL, instantSearchInstance }) {
        this._clearRefinementsAndSearch = () => {
          helper
            .setState(
              clearRefinements({
                helper,
                includedAttributes: restrictedTo,
                clearsQuery,
              })
            )
            .search();
        };

        this._createClearAllURL = () =>
          createURL(
            clearRefinements({
              helper,
              includedAttributes: restrictedTo,
              clearsQuery,
            })
          );

        const refinements = transformItems(
          getFilteredRefinements(
            {},
            helper.state,
            attributeNames,
            onlyListedAttributes,
            clearsQuery
          )
        );

        const _createURL = refinement =>
          createURL(clearRefinementFromState(helper.state, refinement));
        const _clearRefinement = refinement =>
          clearRefinement(helper, refinement);

        renderFn(
          {
            attributes: attributesObj,
            clearAllClick: this._clearRefinementsAndSearch,
            clearAllURL: this._createClearAllURL(),
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
          getFilteredRefinements(
            results,
            state,
            attributeNames,
            onlyListedAttributes,
            clearsQuery
          )
        );

        const _createURL = refinement =>
          createURL(clearRefinementFromState(helper.state, refinement));
        const _clearRefinement = refinement =>
          clearRefinement(helper, refinement);

        renderFn(
          {
            attributes: attributesObj,
            clearAllClick: this._clearRefinementsAndSearch,
            clearAllURL: this._createClearAllURL(),
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

function getFilteredRefinements(
  results,
  state,
  attributeNames,
  onlyListedAttributes,
  clearsQuery
) {
  let refinements = getRefinements(results, state, clearsQuery);
  const otherAttributeNames = reduce(
    refinements,
    (res, refinement) => {
      if (
        attributeNames.indexOf(refinement.attributeName) === -1 &&
        res.indexOf(refinement.attributeName === -1)
      ) {
        res.push(refinement.attributeName);
      }
      return res;
    },
    []
  );
  refinements = refinements.sort(
    compareRefinements.bind(null, attributeNames, otherAttributeNames)
  );
  if (onlyListedAttributes && !isEmpty(attributeNames)) {
    refinements = filter(
      refinements,
      refinement => attributeNames.indexOf(refinement.attributeName) !== -1
    );
  }
  return refinements.map(computeLabel);
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

function computeLabel(value) {
  // default to `value.name` if no operators
  value.computedLabel = value.name;

  if (value.hasOwnProperty('operator') && typeof value.operator === 'string') {
    let displayedOperator = value.operator;
    if (value.operator === '>=') displayedOperator = '≥';
    if (value.operator === '<=') displayedOperator = '≤';
    value.computedLabel = `${displayedOperator} ${value.name}`;
  }

  return value;
}
