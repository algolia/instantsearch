/** @jsx h */

import { connectMenu } from 'instantsearch-core';
import { createDocumentationMessageGenerator } from 'instantsearch-core/internal';
import { suitComponent as component } from 'instantsearch-core/internal';
import { createMenuComponent, cx } from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';

import TemplateComponent from '../../components/Template/Template';
import { prepareTemplateProps } from '../../lib/templating';
import { getContainerNode, shouldRefineFromItemClick } from '../../lib/utils';

import defaultTemplates from './defaultTemplates';

import type { PreparedTemplateProps } from '../../lib/templating';
import type { ComponentCSSClasses, Template } from '../../types';
import type {
  MenuConnectorParams,
  MenuRenderState,
  MenuWidgetDescription,
} from 'instantsearch-core';
import type { RendererOptions, WidgetFactory } from 'instantsearch-core';
import type { MenuItemComponentProps } from 'instantsearch-ui-components';

const withUsage = createDocumentationMessageGenerator({ name: 'menu' });
const suit = component('Menu');

export type MenuCSSClasses = Partial<{
  /**
   * CSS class to add to the root element.
   */
  root: string | string[];
  /**
   * CSS class to add to the root element when no refinements.
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
   * CSS class to add to each selected item element.
   */
  selectedItem: string | string[];
  /**
   * CSS class to add to each link (when using the default template).
   */
  link: string | string[];
  /**
   * CSS class to add to each label (when using the default template).
   */
  label: string | string[];
  /**
   * CSS class to add to each count element (when using the default template).
   */
  count: string | string[];
  /**
   * CSS class to add to the show more button.
   */
  showMore: string | string[];
  /**
   * CSS class to add to the disabled show more button.
   */
  disabledShowMore: string | string[];
}>;

export type MenuTemplates = Partial<{
  /**
   * Item template.
   */
  item: Template<{
    count: number;
    cssClasses: MenuCSSClasses;
    isRefined: boolean;
    label: string;
    url: string;
    value: string;
  }>;
  /**
   * Template used for the show more text, provided with `isShowingMore` data property.
   */
  showMoreText: Template<{
    isShowingMore: boolean;
  }>;
}>;

export type MenuComponentCSSClasses = ComponentCSSClasses<MenuCSSClasses>;

export type MenuComponentTemplates = Required<MenuTemplates>;

export type MenuWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;
  /**
   * Customize the output through templating.
   */
  templates?: MenuTemplates;
  /**
   * CSS classes to add to the wrapping elements.
   */
  cssClasses?: MenuCSSClasses;
};

const MenuUiComponent = createMenuComponent({
  createElement: h,
  Fragment,
});

const renderer = ({
  containerNode,
  cssClasses,
  userCssClasses,
  renderState,
  templates,
  showMore,
}: {
  containerNode: HTMLElement;
  cssClasses: MenuComponentCSSClasses;
  userCssClasses: MenuCSSClasses;
  renderState: {
    templateProps?: PreparedTemplateProps<MenuTemplates>;
  };
  templates: MenuTemplates;
  showMore?: boolean;
}) => {
  // Latest render values, read by the item component so that it keeps the
  // same identity across renders (a new one would remount every item).
  let current: Pick<MenuRenderState, 'refine' | 'createURL'>;

  const itemComponent = ({
    item,
    className,
    children,
  }: MenuItemComponentProps) => (
    <li
      className={className}
      onClick={(originalEvent) => {
        if (shouldRefineFromItemClick(originalEvent, item.isRefined)) {
          current.refine(item.value);
        }
      }}
    >
      {templates.item ? (
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
      isShowingMore,
      toggleShowMore,
      canToggleShowMore,
    }: MenuRenderState & RendererOptions<MenuConnectorParams>,
    isFirstRendering: boolean
  ) => {
    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps<MenuTemplates>({
        defaultTemplates,
        templates,
      });
      return;
    }

    current = { refine, createURL };

    render(
      <MenuUiComponent
        items={items}
        createURL={createURL}
        itemComponent={itemComponent}
        showMore={showMore}
        canToggleShowMore={canToggleShowMore}
        isShowingMore={isShowingMore}
        onToggleShowMore={toggleShowMore}
        showMoreTextComponent={({ isShowingMore: isShowingMoreText }) => (
          <TemplateComponent
            {...renderState.templateProps!}
            templateKey="showMoreText"
            rootTagName="fragment"
            data={{ isShowingMore: isShowingMoreText }}
          />
        )}
        classNames={userCssClasses}
      />,
      containerNode
    );
  };
};

export type MenuWidget = WidgetFactory<
  MenuWidgetDescription & { $$widgetType: 'ais.menu' },
  MenuConnectorParams,
  MenuWidgetParams
>;

const menu: MenuWidget = function menu(widgetParams) {
  const {
    container,
    attribute,
    sortBy,
    limit,
    showMore,
    showMoreLimit,
    cssClasses: userCssClasses = {},
    templates = {},
    transformItems,
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
    link: cx(suit({ descendantName: 'link' }), userCssClasses.link),
    label: cx(suit({ descendantName: 'label' }), userCssClasses.label),
    count: cx(suit({ descendantName: 'count' }), userCssClasses.count),
    showMore: cx(suit({ descendantName: 'showMore' }), userCssClasses.showMore),
    disabledShowMore: cx(
      suit({ descendantName: 'showMore', modifierName: 'disabled' }),
      userCssClasses.disabledShowMore
    ),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    userCssClasses,
    renderState: {},
    templates,
    showMore,
  });

  const makeWidget = connectMenu(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget({
      attribute,
      limit,
      showMore,
      showMoreLimit,
      sortBy,
      transformItems,
    }),
    $$widgetType: 'ais.menu',
  };
};

export default menu;
