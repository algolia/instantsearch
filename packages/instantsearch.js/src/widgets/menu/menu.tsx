/** @jsx h */

import { cx } from '@algolia/ui-components-shared';
import { h, render } from 'preact';

import RefinementList from '../../components/RefinementList/RefinementList';
import connectMenu from '../../connectors/menu/connectMenu';
import { component } from '../../lib/suit';
import { prepareTemplateProps } from '../../lib/templating';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import defaultTemplates from './defaultTemplates';

import type {
  MenuConnectorParams,
  MenuRenderState,
  MenuWidgetDescription,
} from '../../connectors/menu/connectMenu';
import type { PreparedTemplateProps } from '../../lib/templating';
import type {
  ComponentCSSClasses,
  RendererOptions,
  Template,
  WidgetFactory,
} from '../../types';

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
   * Item template. The string template gets the same values as the function.
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
   * Template used for the show more text, provided with `isShowingMore`, `showMoreCount` data properties.
   */
  showMoreText: Template<{ isShowingMore: boolean; showMoreCount: number }>;
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

const renderer =
  ({
    containerNode,
    cssClasses,
    renderState,
    templates,
    showMore,
  }: {
    containerNode: HTMLElement;
    cssClasses: MenuComponentCSSClasses;
    renderState: {
      templateProps?: PreparedTemplateProps<MenuComponentTemplates>;
    };
    templates: MenuTemplates;
    showMore?: boolean;
  }) =>
  (
    {
      refine,
      items,
      createURL,
      instantSearchInstance,
      isShowingMore,
      showMoreCount,
      toggleShowMore,
      canToggleShowMore,
    }: MenuRenderState & RendererOptions<MenuConnectorParams>,
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

    const facetValues = items.map((facetValue) => ({
      ...facetValue,
      url: createURL(facetValue.value),
    }));

    render(
      <RefinementList
        createURL={createURL}
        cssClasses={cssClasses}
        facetValues={facetValues}
        showMore={showMore}
        templateProps={renderState.templateProps!}
        toggleRefinement={refine}
        toggleShowMore={toggleShowMore}
        isShowingMore={isShowingMore}
        showMoreCount={showMoreCount}
        canToggleShowMore={canToggleShowMore}
      />,
      containerNode
    );
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
