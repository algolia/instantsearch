/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import RefinementList from '../../components/RefinementList/RefinementList';
import connectRatingMenu from '../../connectors/rating-menu/connectRatingMenu';
import defaultTemplates from './defaultTemplates';
import {
  prepareTemplateProps,
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';

const withUsage = createDocumentationMessageGenerator({ name: 'rating-menu' });
const suit = component('RatingMenu');

const renderer = ({ containerNode, cssClasses, templates, renderState }) => (
  { refine, items, createURL, instantSearchInstance },
  isFirstRendering
) => {
  if (isFirstRendering) {
    renderState.templateProps = prepareTemplateProps({
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
      facetValues={items}
      templateProps={renderState.templateProps}
      toggleRefinement={refine}
    >
      <svg xmlns="http://www.w3.org/2000/svg" style="display:none;">
        <symbol id={suit({ descendantName: 'starSymbol' })} viewBox="0 0 24 24">
          <path d="M12 .288l2.833 8.718h9.167l-7.417 5.389 2.833 8.718-7.416-5.388-7.417 5.388 2.833-8.718-7.416-5.389h9.167z" />
        </symbol>
        <symbol
          id={suit({ descendantName: 'starEmptySymbol' })}
          viewBox="0 0 24 24"
        >
          <path d="M12 6.76l1.379 4.246h4.465l-3.612 2.625 1.379 4.246-3.611-2.625-3.612 2.625 1.379-4.246-3.612-2.625h4.465l1.38-4.246zm0-6.472l-2.833 8.718h-9.167l7.416 5.389-2.833 8.718 7.417-5.388 7.416 5.388-2.833-8.718 7.417-5.389h-9.167l-2.833-8.718z" />
        </symbol>
      </svg>
    </RefinementList>,
    containerNode
  );
};

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
 * @property  {string|string[]} [fullStarIcon] CSS class to add to each full star element (when using the default template).
 * @property  {string|string[]} [emptyStarIcon] CSS class to add to each empty star element (when using the default template).
 * @property  {string|string[]} [label] CSS class to add to each label.
 * @property  {string|string[]} [count] CSS class to add to each counter.
 */

/**
 * @typedef {Object} RatingMenuWidgetOptions
 * @property {string|HTMLElement} container Place where to insert the widget in your webpage.
 * @property {string} attribute Name of the attribute in your records that contains the ratings.
 * @property {number} [max = 5] The maximum rating value.
 * @property {RatingMenuWidgetTemplates} [templates] Templates to use for the widget.
 * @property {RatingMenuWidgetCssClasses} [cssClasses] CSS classes to add.
 */

/**
 * Rating menu is used for displaying grade like filters. The values are normalized within boundaries.
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
 * search.addWidgets([
 *   instantsearch.widgets.ratingMenu({
 *     container: '#stars',
 *     attribute: 'rating',
 *     max: 5,
 *   })
 * ]);
 */
export default function ratingMenu({
  container,
  attribute,
  max = 5,
  cssClasses: userCssClasses = {},
  templates = defaultTemplates,
} = {}) {
  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
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
  });

  const makeWidget = connectRatingMenu(specializedRenderer, () =>
    render(null, containerNode)
  );

  return makeWidget({ attribute, max });
}
