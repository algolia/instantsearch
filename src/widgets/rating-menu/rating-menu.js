import React, { render, unmountComponentAtNode } from 'preact-compat';
import cx from 'classnames';
import RefinementList from '../../components/RefinementList/RefinementList.js';
import connectRatingMenu from '../../connectors/rating-menu/connectRatingMenu.js';
import defaultTemplates from './defaultTemplates.js';
import defaultLabels from './defaultLabels.js';
import { prepareTemplateProps, getContainerNode } from '../../lib/utils.js';
import { component } from '../../lib/suit.js';

const suit = component('StarRating');

const renderer = ({
  containerNode,
  cssClasses,
  templates,
  transformData,
  renderState,
  labels,
}) => (
  { refine, items, createURL, instantSearchInstance },
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
ratingMenu({
  container,
  attribute,
  [ max = 5 ],
  [ cssClasses.{root, list, item, selectedItem, disabledItem, link, starIcon, fullStarIcon, emptyStarIcon, label, count} ],
  [ templates.{header,item,footer} ],
  [ transformData.{item} ],
  [ labels.{andUp} ],
})`;

/**
 * @typedef {Object} RatingMenuWidgetLabels
 * @property {string} [andUp] Label used to suffix the ratings.
 */

/**
 * @typedef {Object} RatingMenuWidgetTemplates
 * @property  {string|function} [item] Item template, provided with `name`, `count`, `isRefined`, `url` data properties.
 */

/**
 * @typedef {Object} RatingMenuWidgetCssClasses
 * @property  {string|string[]} [root] CSS class to add to the root element.
 * @property  {string|string[]} [noRefinementRoot] CSS class to add to the root element when there's no refinements.
 * @property  {string|string[]} [list] CSS class to add to the list element.
 * @property  {string|string[]} [item] CSS class to add to each item element.
 * @property  {string|string[]} [selectedItem] CSS class to add the selected item element.
 * @property  {string|string[]} [disabledItem] CSS class to add a disabled item element.
 * @property  {string|string[]} [link] CSS class to add to each link element.
 * @property  {string|string[]} [starIcon] CSS class to add to each star element (when using the default template).
 * @property  {string|string[]} [fulltarIcon] CSS class to add to each full star element (when using the default template).
 * @property  {string|string[]} [emptytarIcon] CSS class to add to each empty star element (when using the default template).
 * @property  {string|string[]} [label] CSS class to add to each label.
 * @property  {string|string[]} [count] CSS class to add to each counter.
 */

/**
 * @typedef {Object} RatingMenuWidgetTransforms
 * @property  {function} [item] Function to change the object passed to the `item` template.
 */

/**
 * @typedef {Object} RatingMenuWidgetOptions
 * @property {string|HTMLElement} container Place where to insert the widget in your webpage.
 * @property {string} attribute Name of the attribute in your records that contains the ratings.
 * @property {number} [max=5] The maximum rating value.
 * @property {RatingMenuWidgetLabels} [labels] Labels used by the default template.
 * @property {RatingMenuWidgetTemplates} [templates] Templates to use for the widget.
 * @property {RatingMenuWidgetTransforms} [transformData] Object that contains the functions to be applied on the data * before being used for templating. Valid keys are `body` for the body template.
 * @property {RatingMenuWidgetCssClasses} [cssClasses] CSS classes to add.
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
 * @devNovel RatingMenu
 * @category filter
 * @param {RatingMenuWidgetOptions} $0 RatingMenu widget options.
 * @return {Widget} A new RatingMenu widget instance.
 * @example
 * search.addWidget(
 *   instantsearch.widgets.ratingMenu({
 *     container: '#stars',
 *     attribute: 'rating',
 *     max: 5,
 *     labels: {
 *       andUp: '& Up'
 *     }
 *   })
 * );
 */
export default function ratingMenu({
  container,
  attribute,
  max = 5,
  cssClasses: userCssClasses = {},
  labels = defaultLabels,
  templates = defaultTemplates,
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
    renderState: {},
    templates,
    transformData,
    labels,
  });

  try {
    const makeWidget = connectRatingMenu(specializedRenderer, () =>
      unmountComponentAtNode(containerNode)
    );
    return makeWidget({ attribute, max });
  } catch (error) {
    throw new Error(usage);
  }
}
