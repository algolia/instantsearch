/** @jsx h */

import { connectRatingMenu } from 'instantsearch-core';
import { createDocumentationMessageGenerator } from 'instantsearch-core/internal';
import { suitComponent as component } from 'instantsearch-core/internal';
import { createRatingMenuComponent, cx } from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';

import TemplateComponent from '../../components/Template/Template';
import { prepareTemplateProps } from '../../lib/templating';
import { getContainerNode, shouldRefineFromItemClick } from '../../lib/utils';

import type { PreparedTemplateProps } from '../../lib/templating';
import type { ComponentCSSClasses, Template } from '../../types';
import type {
  RatingMenuWidgetDescription,
  RatingMenuConnectorParams,
  RatingMenuRenderState,
} from 'instantsearch-core';
import type { RendererOptions, WidgetFactory } from 'instantsearch-core';
import type { RatingMenuItemComponentProps } from 'instantsearch-ui-components';

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

const RatingMenuUiComponent = createRatingMenuComponent({
  createElement: h,
  Fragment,
});

const renderer = ({
  containerNode,
  cssClasses,
  userCssClasses,
  templates,
  renderState,
}: {
  containerNode: HTMLElement;
  cssClasses: RatingMenuComponentCSSClasses;
  userCssClasses: RatingMenuCSSClasses;
  templates: RatingMenuTemplates;
  renderState: {
    templateProps?: PreparedTemplateProps<RatingMenuTemplates>;
  };
}) => {
  // Latest render values, read by the item component so that it keeps the
  // same identity across renders (a new one would remount every item).
  let current: Pick<RatingMenuRenderState, 'refine' | 'createURL'>;

  const itemComponent = ({
    item,
    className,
    children,
  }: RatingMenuItemComponentProps) => (
    <li
      className={className}
      onClick={(originalEvent) => {
        // Items without results are disabled, like in the other flavors,
        // unless they're selected so that they can be cleared.
        if (
          shouldRefineFromItemClick(originalEvent, item.isRefined) &&
          (item.count > 0 || item.isRefined)
        ) {
          current.refine(item.value);
        }
      }}
    >
      {templates.item !== undefined ? (
        <TemplateComponent
          {...renderState.templateProps!}
          templateKey="item"
          rootTagName="fragment"
          data={{
            ...item,
            url: current.createURL(item.value),
            cssClasses,
          }}
        />
      ) : (
        children
      )}
    </li>
  );

  return (
    {
      refine,
      items,
      createURL,
      canRefine,
    }: RatingMenuRenderState & RendererOptions<RatingMenuConnectorParams>,
    isFirstRendering: boolean
  ) => {
    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps<RatingMenuTemplates>({
        defaultTemplates: {},
        templates,
      });

      return;
    }

    current = { refine, createURL };

    render(
      <RatingMenuUiComponent
        items={items}
        canRefine={canRefine}
        createURL={createURL}
        itemComponent={itemComponent}
        classNames={userCssClasses}
      />,
      containerNode
    );
  };
};

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
    userCssClasses,
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
