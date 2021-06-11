/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import RefinementList from '../../components/RefinementList/RefinementList';
import connectMenu, {
  MenuConnectorParams,
  MenuRenderState,
  MenuWidgetDescription,
} from '../../connectors/menu/connectMenu';
import defaultTemplates from './defaultTemplates';
import {
  prepareTemplateProps,
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import {
  ComponentCSSClasses,
  ComponentTemplates,
  RendererOptions,
  Template,
  WidgetFactory,
} from '../../types';
import { PreparedTemplateProps } from '../../lib/utils/prepareTemplateProps';

const withUsage = createDocumentationMessageGenerator({ name: 'menu' });
const suit = component('Menu');

export type MenuCSSClasses = {
  /**
   * CSS class to add to the root element.
   */
  root?: string | string[];
  /**
   * CSS class to add to the root element when no refinements.
   */
  noRefinementRoot?: string | string[];
  /**
   * CSS class to add to the list element.
   */
  list?: string | string[];
  /**
   * CSS class to add to each item element.
   */
  item?: string | string[];
  /**
   * CSS class to add to each selected item element.
   */
  selectedItem?: string | string[];
  /**
   * CSS class to add to each link (when using the default template).
   */
  link?: string | string[];
  /**
   * CSS class to add to each label (when using the default template).
   */
  label?: string | string[];
  /**
   * CSS class to add to each count element (when using the default template).
   */
  count?: string | string[];
  /**
   * CSS class to add to the show more button.
   */
  showMore?: string | string[];
  /**
   * CSS class to add to the disabled show more button.
   */
  disabledShowMore?: string | string[];
};

export type MenuTemplates = {
  /**
   * Item template. The string template gets the same values as the function.
   */
  item?: Template<{
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
  showMoreText?: Template<{
    isShowingMore: boolean;
  }>;
};

export type MenuComponentCSSClasses = ComponentCSSClasses<MenuCSSClasses>;

export type MenuComponentTemplates = ComponentTemplates<MenuTemplates>;

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

const renderer = ({
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
  templates: MenuComponentTemplates;
  showMore?: boolean;
}) => (
  {
    refine,
    items,
    createURL,
    instantSearchInstance,
    isShowingMore,
    toggleShowMore,
    canToggleShowMore,
  }: MenuRenderState & RendererOptions<MenuConnectorParams>,
  isFirstRendering: boolean
) => {
  if (isFirstRendering) {
    renderState.templateProps = prepareTemplateProps<MenuComponentTemplates>({
      defaultTemplates,
      templatesConfig: instantSearchInstance.templatesConfig,
      templates,
    });
    return;
  }

  const facetValues = items.map(facetValue => ({
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
    templates: userTemplates = {},
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
  const templates = {
    ...defaultTemplates,
    ...userTemplates,
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
