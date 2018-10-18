import { getRefinements, checkRendering } from '../../lib/utils.js';

const usage = `Usage:
var customCurrentRefinements = connectCurrentRefinements(function renderFn(params, isFirstRendering) {
  // params = {
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
    [ excludedAttributes = ['query'] ],
    [ transformItems ],
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/v2/connectors/connectCurrentRefinements.html
`;

/**
 * @typedef {Object} CurrentRefinement
 * @property {"facet"|"exclude"|"disjunctive"|"hierarchical"|"numeric"|"query"} type The type of the refinement
 * @property {string} attribute The attribute on which the refinement is applied
 * @property {string} label The label of the refinement to display
 * @property {string} value The raw value of the refinement
 * @property {function} refine The function to remove the refinement
 * @property {string} [operator] The raw value of the refinement
 * @property {boolean} [exhaustive] Whether the count is exhaustive, only if applicable
 * @property {number} [count] number of items found, if applicable
 */

/**
 * @typedef {Object} CurrentRefinementsRenderingOptions
 * @property {function(item)} refine Clears a single refinement
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
 * @property {string[]} [includedAttributes] The attributes to include in the refinements (all by default)
 * @property {string[]} [excludedAttributes = ["query"]] The attributes to exclude from the refinements
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
 *         + refinement.label + '</a></li>';
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
      includedAttributes,
      excludedAttributes = ['query'],
      transformItems = items => items,
    } = widgetParams;
    const clearsQuery = excludedAttributes.indexOf('query') !== -1;

    return {
      init({ helper, createURL, instantSearchInstance }) {
        const refinements = transformItems(
          getNormalizedRefinements({
            results: {},
            state: helper.state,
            helper,
            includedAttributes,
            excludedAttributes,
            clearsQuery,
          })
        );

        renderFn(
          {
            refine: refinement => clearRefinement(helper, refinement),
            createUrl: refinement =>
              createURL(clearRefinementFromState(helper.state, refinement)),
            refinements,
            instantSearchInstance,
            widgetParams,
          },
          true
        );
      },

      render({ results, helper, state, createURL, instantSearchInstance }) {
        const refinements = transformItems(
          getNormalizedRefinements({
            results,
            state,
            helper,
            includedAttributes,
            excludedAttributes,
            clearsQuery,
          })
        );

        renderFn(
          {
            refine: refinement => clearRefinement(helper, refinement),
            createURL: refinement =>
              createURL(clearRefinementFromState(helper.state, refinement)),
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

function getNormalizedRefinements({
  results,
  state,
  helper,
  includedAttributes,
  excludedAttributes,
  clearsQuery,
}) {
  const refinements = getRefinements(results, state, clearsQuery)
    .filter(
      refinement =>
        !includedAttributes ||
        includedAttributes.indexOf(refinement.attributeName) !== -1
    )
    .filter(
      refinement => excludedAttributes.indexOf(refinement.attributeName) === -1
    )
    .map(normalizeRefinementItem);

  return normalizeRefinements(refinements, helper);
}

function clearRefinementFromState(state, refinementItem) {
  switch (refinementItem.type) {
    case 'facet':
      return state.removeFacetRefinement(
        refinementItem.attribute,
        refinementItem.value
      );
    case 'disjunctive':
      return state.removeDisjunctiveFacetRefinement(
        refinementItem.attribute,
        refinementItem.value
      );
    case 'hierarchical':
      return state.clearRefinements(refinementItem.attribute);
    case 'exclude':
      return state.removeExcludeRefinement(
        refinementItem.attribute,
        refinementItem.value
      );
    case 'numeric':
      return state.removeNumericRefinement(
        refinementItem.attribute,
        refinementItem.operator,
        refinementItem.value
      );
    case 'tag':
      return state.removeTagRefinement(refinementItem.value);
    case 'query':
      return state.setQueryParameter('query', '');
    default:
      throw new Error(
        `clearRefinement: type ${refinementItem.type} is not handled`
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

function normalizeRefinementItem(item) {
  const attribute = item.type === 'query' ? 'query' : item.attributeName;
  const label = item.operator
    ? `${getOperatorSymbol(item.operator)} ${item.name}`
    : item.name;
  const value = item.type === 'numeric' ? Number(item.name) : item.name;

  return {
    attribute,
    type: item.type,
    value,
    label: item.type === 'query' ? `"${label}"` : label,
    ...(item.operator && { operator: item.operator }),
    ...(item.count && { count: item.count }),
    ...(item.exhaustive && { exhaustive: item.exhaustive }),
  };
}

function compareObjects(a, b, attribute) {
  if (a[attribute] === b[attribute]) {
    return 0;
  }

  if (a[attribute] < b[attribute]) {
    return -1;
  }

  return 1;
}

function normalizeRefinements(refinements, helper) {
  return refinements.reduce(
    (results, currentRefinement) =>
      [
        {
          attribute: currentRefinement.attribute,
          items: refinements
            .filter(result => result.attribute === currentRefinement.attribute)
            .sort((a, b) => compareObjects(a, b, 'label')),
          refine: refinement => clearRefinement(helper, refinement),
        },
        ...results.filter(
          result => result.attribute !== currentRefinement.attribute
        ),
      ].sort((a, b) => compareObjects(a, b, 'attribute')),
    []
  );
}
