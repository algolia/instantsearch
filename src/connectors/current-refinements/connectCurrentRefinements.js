import { getRefinements, checkRendering } from '../../lib/utils.js';

const usage = `Usage:
var customCurrentRefinements = connectCurrentRefinements(function renderFn(params, isFirstRendering) {
  // params = {
  //   items,
  //   refine,
  //   createURL,
  //   instantSearchInstance,
  //   widgetParams,
  // }
});
search.addWidget(
  customCurrentRefinements({
    [ includedAttributes ],
    [ excludedAttributes = ['query'] ],
    [ transformItems ],
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/v2/connectors/connectCurrentRefinements.html
`;

/**
 * @typedef {Object} Refinement
 * @property {"facet"|"exclude"|"disjunctive"|"hierarchical"|"numeric"|"query"} type The type of the refinement
 * @property {string} attribute The attribute on which the refinement is applied
 * @property {string} label The label of the refinement to display
 * @property {string} value The raw value of the refinement
 * @property {string} [operator] The value of the operator, only if applicable
 * @property {boolean} [exhaustive] Whether the count is exhaustive, only if applicable
 * @property {number} [count] number of items found, if applicable
 */

/**
 * @typedef {Object} RefinementItem
 * @property {string} attribute The attribute on which the refinement is applied
 * @property {function} refine The function to remove the refinement
 * @property {Refinement[]} refinements The current refinements
 */

/**
 * @typedef {Object} CurrentRefinementsRenderingOptions
 * @property {function(item)} refine Clears a single refinement
 * @property {function(item): string} createURL Creates an individual URL where a single refinement is cleared
 * @property {RefinementItem[]} items All the refinement items
 * @property {Object} widgetParams All original `CustomCurrentRefinementsWidgetOptions` forwarded to the `renderFn`.
 */

/**
 * @typedef {Object} CustomCurrentRefinementsWidgetOptions
 * @property {string[]} [includedAttributes] The attributes to include in the refinements (all by default). Cannot be used with `excludedAttributes`.
 * @property {string[]} [excludedAttributes = ["query"]] The attributes to exclude from the refinements. Cannot be used with `includedAttributes`.
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
 * function renderFn(currentRefinementsRenderingOptions, isFirstRendering) {
 *   var containerNode = currentRefinementsRenderingOptions.widgetParams.containerNode;
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
 *   if (currentRefinementsRenderingOptions.items
 *       && currentRefinementsRenderingOptions.items.length > 0) {
 *     var list = currentRefinementsRenderingOptions.items.map(function(item) {
 *       return '<li>' + item.attribute +
 *          '<ul>' +
 *            item.refinements.map(function (refinement) {
 *              return <a href="' + currentRefinementsRenderingOptions.createURL(refinement) + '" data-attribute="' + item.attribute + '">'
 *                + refinement.label + '</a>'
 *              }).join('') +
 *            '</ul>'
 *        '</li>';
 *     });
 *
 *     currentRefinementsRenderingOptions.find('ul').html(list);
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
    if (widgetParams.includedAttributes && widgetParams.excludedAttributes) {
      throw new Error(
        '`includedAttributes` and `excludedAttributes` cannot be used together.'
      );
    }

    const {
      includedAttributes,
      excludedAttributes = ['query'],
      transformItems = items => items,
    } = widgetParams;

    return {
      init({ helper, createURL, instantSearchInstance }) {
        const items = transformItems(
          getFilteredRefinements({
            results: {},
            state: helper.state,
            helper,
            includedAttributes,
            excludedAttributes,
          })
        );

        renderFn(
          {
            items,
            refine: refinement => clearRefinement(helper, refinement),
            createURL: refinement =>
              createURL(clearRefinementFromState(helper.state, refinement)),
            instantSearchInstance,
            widgetParams,
          },
          true
        );
      },

      render({ results, helper, state, createURL, instantSearchInstance }) {
        const items = transformItems(
          getFilteredRefinements({
            results,
            state,
            helper,
            includedAttributes,
            excludedAttributes,
          })
        );

        renderFn(
          {
            items,
            refine: refinement => clearRefinement(helper, refinement),
            createURL: refinement =>
              createURL(clearRefinementFromState(helper.state, refinement)),
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

function getFilteredRefinements({
  results,
  state,
  helper,
  includedAttributes,
  excludedAttributes,
}) {
  const clearsQuery =
    (includedAttributes || []).indexOf('query') !== -1 ||
    (excludedAttributes || []).indexOf('query') === -1;

  const filterFunction = includedAttributes
    ? item => includedAttributes.indexOf(item.attributeName) !== -1
    : item => excludedAttributes.indexOf(item.attributeName) === -1;

  const items = getRefinements(results, state, clearsQuery)
    .filter(filterFunction)
    .map(normalizeRefinement);

  return groupItemsByRefinements(items, helper);
}

function clearRefinementFromState(state, refinement) {
  switch (refinement.type) {
    case 'facet':
      return state.removeFacetRefinement(
        refinement.attribute,
        refinement.value
      );
    case 'disjunctive':
      return state.removeDisjunctiveFacetRefinement(
        refinement.attribute,
        refinement.value
      );
    case 'hierarchical':
      return state.removeHierarchicalFacetRefinement(refinement.attribute);
    case 'exclude':
      return state.removeExcludeRefinement(
        refinement.attribute,
        refinement.value
      );
    case 'numeric':
      return state.removeNumericRefinement(
        refinement.attribute,
        refinement.operator,
        refinement.value
      );
    case 'tag':
      return state.removeTagRefinement(refinement.value);
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
      return operator;
  }
}

function normalizeRefinement(refinement) {
  const value =
    refinement.type === 'numeric' ? Number(refinement.name) : refinement.name;
  const label = refinement.operator
    ? `${getOperatorSymbol(refinement.operator)} ${refinement.name}`
    : refinement.name;

  return {
    attribute: refinement.attributeName,
    type: refinement.type,
    value,
    label,
    ...(refinement.operator !== undefined && { operator: refinement.operator }),
    ...(refinement.count !== undefined && { count: refinement.count }),
    ...(refinement.exhaustive !== undefined && {
      exhaustive: refinement.exhaustive,
    }),
  };
}

function groupItemsByRefinements(items, helper) {
  return items.reduce(
    (results, currentItem) => [
      ...results.filter(result => result.attribute !== currentItem.attribute),
      {
        attribute: currentItem.attribute,
        refinements: items
          .filter(result => result.attribute === currentItem.attribute)
          // We want to keep the order of refinements except the numeric ones.
          .sort((a, b) => (a.type === 'numeric' ? a.value - b.value : 0)),
        refine: refinement => clearRefinement(helper, refinement),
      },
    ],
    []
  );
}
