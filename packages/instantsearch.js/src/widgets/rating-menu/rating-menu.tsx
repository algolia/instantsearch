/** @jsx h */

import { cx } from '@algolia/ui-components-shared';
import { h, render } from 'preact';

import RefinementList from '../../components/RefinementList/RefinementList';
import connectRatingMenu from '../../connectors/rating-menu/connectRatingMenu';
import { component } from '../../lib/suit';
import { prepareTemplateProps } from '../../lib/templating';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import defaultTemplates from './defaultTemplates';

import type {
  RatingMenuWidgetDescription,
  RatingMenuConnectorParams,
  RatingMenuRenderState,
} from '../../connectors/rating-menu/connectRatingMenu';
import type { PreparedTemplateProps } from '../../lib/templating';
import type {
  ComponentCSSClasses,
  RendererOptions,
  Template,
  WidgetFactory,
} from '../../types';

const withUsage = createDocumentationMessageGenerator({ name: 'rating-menu' });
const suit = component('RatingMenu');

export type RatingMenuTemplates = Partial<{
  /**
   * Item template, provided with `name`, `count`, `isRefined`, `url` data properties.
   */
  item: Template<{
    name: string;
    label: string;
    value: string;
    count: number;
    isRefined: boolean;
    url: string;
    stars: [boolean, boolean, boolean, boolean, boolean];
    cssClasses: RatingMenuCSSClasses;
    attribute?: string;
    isFromSearch?: boolean;
  }>;
}>;

export type RatingMenuCSSClasses = Partial<{
  /**
   * CSS class to add to the root element.
   */
  root: string | string[];
  /**
   * CSS class to add to the root element when there's no refinements.
   */
  noRefinementRoot: string | string[];
  /**
   * CSS class to add to the list element.
   */
  list: string | string[];
  /**
   * CSS class to add to each item element.
   */
  item: string | string[];
  /**
   * CSS class to add the selected item element.
   */
  selectedItem: string | string[];
  /**
   * CSS class to add a disabled item element.
   */
  disabledItem: string | string[];
  /**
   * CSS class to add to each link element.
   */
  link: string | string[];
  /**
   * CSS class to add to each star element (when using the default template).
   */
  starIcon: string | string[];
  /**
   * CSS class to add to each full star element (when using the default template).
   */
  fullStarIcon: string | string[];
  /**
   * CSS class to add to each empty star element (when using the default template).
   */
  emptyStarIcon: string | string[];
  /**
   * CSS class to add to each label.
   */
  label: string | string[];
  /**
   * CSS class to add to each counter.
   */
  count: string | string[];
}>;

export type RatingMenuComponentCSSClasses =
  ComponentCSSClasses<RatingMenuCSSClasses>;

export type RatingMenuComponentTemplates = Required<RatingMenuTemplates>;

export type RatingMenuWidgetParams = {
  /**
   * Place where to insert the widget in your webpage.
   */
  container: string | HTMLElement;
  /**
   * Name of the attribute in your records that contains the ratings.
   */
  attribute: string;
  /**
   * The maximum rating value.
   */
  max?: number;
  /**
   * Templates to use for the widget.
   */
  templates?: RatingMenuTemplates;
  /**
   * CSS classes to add.
   */
  cssClasses?: RatingMenuCSSClasses;
};

const renderer =
  ({
    containerNode,
    cssClasses,
    templates,
    renderState,
  }: {
    containerNode: HTMLElement;
    cssClasses: RatingMenuComponentCSSClasses;
    templates: RatingMenuTemplates;
    renderState: {
      templateProps?: PreparedTemplateProps<RatingMenuComponentTemplates>;
    };
  }) =>
  (
    {
      refine,
      items,
      createURL,
      instantSearchInstance,
    }: RatingMenuRenderState & RendererOptions<RatingMenuConnectorParams>,
    isFirstRendering: boolean
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
        templateProps={renderState.templateProps!}
        toggleRefinement={refine}
      >
        <svg style="display:none;">
          <symbol
            id={suit({ descendantName: 'starSymbol' })}
            viewBox="0 0 24 24"
          >
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
 * @param {RatingMenuWidgetParams} widgetParams RatingMenu widget options.
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
export type RatingMenuWidget = WidgetFactory<
  RatingMenuWidgetDescription & { $$widgetType: 'ais.ratingMenu' },
  RatingMenuConnectorParams,
  RatingMenuWidgetParams
>;

const ratingMenu: RatingMenuWidget = function ratingMenu(widgetParams) {
  const {
    container,
    attribute,
    max = 5,
    cssClasses: userCssClasses = {},
    templates = {},
  } = widgetParams || {};
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

  return {
    ...makeWidget({ attribute, max }),
    $$widgetType: 'ais.ratingMenu',
  };
};

export default ratingMenu;
