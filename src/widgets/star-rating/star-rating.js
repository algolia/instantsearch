import React, { render, unmountComponentAtNode } from 'preact-compat';
import cx from 'classnames';

import RefinementList from '../../components/RefinementList/RefinementList.js';
import connectStarRating from '../../connectors/star-rating/connectStarRating.js';
import defaultTemplates from './defaultTemplates.js';
import defaultLabels from './defaultLabels.js';
import { prepareTemplateProps, getContainerNode } from '../../lib/utils.js';
import { component } from '../../lib/suit';

const suit = component('StarRating');

const renderer = ({
  containerNode,
  cssClasses,
  templates,
  collapsible,
  transformData,
  renderState,
  labels,
}) => (
  { refine, items, createURL, instantSearchInstance, hasNoResults },
  isFirstRendering
) => {
  if (isFirstRendering) {
    renderState.templateProps = prepareTemplateProps({
      transformData,
      defaultTemplates,
      templatesConfig: instantSearchInstance.templatesConfig,
      templates,
    });
    return;
  }

  render(
    <RefinementList
      collapsible={collapsible}
      createURL={createURL}
      cssClasses={cssClasses}
      facetValues={items.map(item => ({ ...item, labels }))}
      templateProps={renderState.templateProps}
      toggleRefinement={refine}
    />,
    containerNode
  );
};

const usage = `Usage:
starRating({
  container,
  attribute,
  [ max=5 ],
  [ cssClasses.{root,header,body,footer,list,item,active,link,disabledLink,star,emptyStar,count} ],
  [ templates.{header,item,footer} ],
  [ transformData.{item} ],
  [ labels.{andUp} ],
  [ collapsible=false ]
})`;

/**
 * @typedef {Object} StarWidgetLabels
 * @property {string} [andUp] Label used to suffix the ratings.
 */

/**
 * @typedef {Object} StarWidgetTemplates
 * @property  {string|function} [header] Header template.
 * @property  {string|function} [item] Item template, provided with `name`, `count`, `isRefined`, `url` data properties.
 * @property  {string|function} [footer] Footer template.
 */

/**
 * @typedef {Object} StarWidgetCssClasses
 * @property  {string|string[]} [root] CSS class to add to the root element.
 * @property  {string|string[]} [header] CSS class to add to the header element.
 * @property  {string|string[]} [body] CSS class to add to the body element.
 * @property  {string|string[]} [footer] CSS class to add to the footer element.
 * @property  {string|string[]} [list] CSS class to add to the list element.
 * @property  {string|string[]} [item] CSS class to add to each item element.
 * @property  {string|string[]} [link] CSS class to add to each link element.
 * @property  {string|string[]} [disabledLink] CSS class to add to each disabled link (when using the default template).
 * @property  {string|string[]} [count] CSS class to add to each counters
 * @property  {string|string[]} [star] CSS class to add to each star element (when using the default template).
 * @property  {string|string[]} [emptyStar] CSS class to add to each empty star element (when using the default template).
 * @property  {string|string[]} [active] CSS class to add to each active element.
 */

/**
 * @typedef {Object} StarWidgetCollapsibleOption
 * @property {boolean} collapsed If set to true, the widget will be collapsed at first rendering.
 */

/**
 * @typedef {Object} StarWidgetTransforms
 * @property  {function} [item] Function to change the object passed to the `item` template.
 */

/**
 * @typedef {Object} StarWidgetOptions
 * @property {string|HTMLElement} container Place where to insert the widget in your webpage.
 * @property {string} attribute Name of the attribute in your records that contains the ratings.
 * @property {number} [max=5] The maximum rating value.
 * @property {StarWidgetLabels} [labels] Labels used by the default template.
 * @property {StarWidgetTemplates} [templates] Templates to use for the widget.
 * @property {StarWidgetTransforms} [transformData] Object that contains the functions to be applied on the data * before being used for templating. Valid keys are `body` for the body template.
 * @property {StarWidgetCssClasses} [cssClasses] CSS classes to add.
 * @property {boolean|StarWidgetCollapsibleOption} [collapsible=false] If set to true, the widget can be collapsed. This parameter can also be
 */

/**
 * Star rating is used for displaying grade like filters. The values are normalized within boundaries.
 *
 * The maximum value can be set (with `max`), the minimum is always 0.
 *
 * @requirements
 * The attribute passed to `attribute` must be declared as an
 * [attribute for faceting](https://www.algolia.com/doc/guides/searching/faceting/#declaring-attributes-for-faceting)
 * in your Algolia settings.
 *
 * The values inside this attribute must be JavaScript numbers (not strings).
 *
 * @type {WidgetFactory}
 * @devNovel StarRating
 * @category filter
 * @param {StarWidgetOptions} $0 StarRating widget options.
 * @return {Widget} A new StarRating widget instance.
 * @example
 * search.addWidget(
 *   instantsearch.widgets.starRating({
 *     container: '#stars',
 *     attribute: 'rating',
 *     max: 5,
 *     labels: {
 *       andUp: '& Up'
 *     }
 *   })
 * );
 */
export default function starRating({
  container,
  attribute,
  max = 5,
  cssClasses: userCssClasses = {},
  labels = defaultLabels,
  templates = defaultTemplates,
  collapsible = false,
  transformData,
} = {}) {
  if (!container) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);

  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
    noRefinementRoot: cx(
      suit({ modifierName: 'noRefinement' }),
      userCssClasses.noRefinementRoot
    ),
    list: cx(suit({ descendantName: 'list' }), userCssClasses.list),
    item: cx(suit({ descendantName: 'item' }), userCssClasses.item),
    selectedItem: cx(
      suit({ descendantName: 'item', modifierName: 'selected' }),
      userCssClasses.selectedItem
    ),
    disabledItem: cx(
      suit({ descendantName: 'item', modifierName: 'disabled' }),
      userCssClasses.disabledItem
    ),
    link: cx(suit({ descendantName: 'link' }), userCssClasses.link),
    starIcon: cx(suit({ descendantName: 'starIcon' }), userCssClasses.starIcon),
    fullStarIcon: cx(
      suit({ descendantName: 'starIcon', modifierName: 'full' }),
      userCssClasses.fullStarIcon
    ),
    emptyStarIcon: cx(
      suit({ descendantName: 'starIcon', modifierName: 'empty' }),
      userCssClasses.emptyStarIcon
    ),
    label: cx(suit({ descendantName: 'label' }), userCssClasses.label),
    count: cx(suit({ descendantName: 'count' }), userCssClasses.count),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    collapsible,
    renderState: {},
    templates,
    transformData,
    labels,
  });

  try {
    const makeWidget = connectStarRating(specializedRenderer, () =>
      unmountComponentAtNode(containerNode)
    );
    return makeWidget({ attribute, max });
  } catch (e) {
    throw new Error(usage);
  }
}
