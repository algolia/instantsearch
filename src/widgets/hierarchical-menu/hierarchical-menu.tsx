/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import RefinementList from '../../components/RefinementList/RefinementList';
import connectHierarchicalMenu, {
  HierarchicalMenuItem,
  HierarchicalMenuConnectorParams,
  HierarchicalMenuRenderState,
  HierarchicalMenuWidgetDescription,
} from '../../connectors/hierarchical-menu/connectHierarchicalMenu';
import defaultTemplates from './defaultTemplates';
import { PreparedTemplateProps } from '../../lib/utils/prepareTemplateProps';
import {
  prepareTemplateProps,
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import {
  TransformItems,
  Template,
  WidgetFactory,
  RendererOptions,
  SortBy,
} from '../../types';
import { component } from '../../lib/suit';

const withUsage = createDocumentationMessageGenerator({
  name: 'hierarchical-menu',
});
const suit = component('HierarchicalMenu');

type HierarchicalMenuTemplates = {
  /**
   * Item template, provided with `name`, `count`, `isRefined`, `url` data properties.
   */
  item: Template<{
    name: string;
    count: number;
    isRefined: boolean;
    url: string;
  }>;
  /**
   * Template used for the show more text, provided with `isShowingMore` data property.
   */
  showMoreText: Template<{ isShowingMore: boolean }>;
};

export type HierarchicalMenuCSSClasses = {
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
   * CSS class to add to the child list element.
   */
  childList: string | string[];
  /**
   * CSS class to add to each item element.
   */
  item: string | string[];
  /**
   * CSS class to add to each selected item element.
   */
  selectedItem: string | string[];
  /**
   * CSS class to add to each parent item element.
   */
  parentItem: string | string[];
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
   * CSS class to add to the show more element.
   */
  showMore: string | string[];
  /**
   * CSS class to add to the disabled show more element.
   */
  disabledShowMore: string | string[];
};

type HierarchicalMenuRendererCSSClasses = Required<
  {
    [key in keyof HierarchicalMenuCSSClasses]: string;
  }
>;

export type HierarchicalMenuWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;
  /**
   * Array of attributes to use to generate the hierarchy of the menu.
   */
  attributes: string[];
  /**
   * Separator used in the attributes to separate level values.
   */
  separator?: string;
  /**
   * Prefix path to use if the first level is not the root level.
   */
  rootPath?: string;
  /**
   * Show the siblings of the selected parent level of the current refined value.
   *
   * With `showParentLevel` set to `true` (default):
   * - Parent lvl0
   *   - **lvl1**
   *     - **lvl2**
   *     - lvl2
   *     - lvl2
   *   - lvl 1
   *   - lvl 1
   * - Parent lvl0
   * - Parent lvl0
   *
   * With `showParentLevel` set to `false`:
   * - Parent lvl0
   *   - **lvl1**
   *     - **lvl2**
   * - Parent lvl0
   * - Parent lvl0
   */
  showParentLevel?: boolean;
  /**
   * Max number of values to display.
   */
  limit?: number;
  /**
   * Whether to display the "show more" button.
   */
  showMore?: boolean;
  /**
   * Max number of values to display when showing more.
   * does not impact the root level.
   */
  showMoreLimit?: number;
  /**
   * How to sort refinements. Possible values: `count|isRefined|name:asc|name:desc`.
   * You can also use a sort function that behaves like the standard Javascript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax).
   */
  sortBy?: SortBy<HierarchicalMenuItem>;
  /**
   * Function to transform the items passed to the templates.
   */
  transformItems?: TransformItems<HierarchicalMenuItem>;
  /**
   * Templates to use for the widget.
   */
  templates?: Partial<HierarchicalMenuTemplates>;
  /**
   * CSS classes to add to the wrapping elements.
   */
  cssClasses?: Partial<HierarchicalMenuCSSClasses>;
};

const renderer = ({
  cssClasses,
  containerNode,
  showMore,
  templates,
  renderState,
}: {
  cssClasses: HierarchicalMenuRendererCSSClasses;
  containerNode: HTMLElement;
  showMore: boolean;
  templates: Partial<HierarchicalMenuTemplates>;
  renderState: {
    templateProps?: PreparedTemplateProps<HierarchicalMenuTemplates>;
  };
}) => (
  {
    createURL,
    items,
    refine,
    instantSearchInstance,
    isShowingMore,
    toggleShowMore,
    canToggleShowMore,
  }: HierarchicalMenuRenderState &
    RendererOptions<HierarchicalMenuConnectorParams>,
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
      templateProps={renderState.templateProps}
      toggleRefinement={refine}
      showMore={showMore}
      toggleShowMore={toggleShowMore}
      isShowingMore={isShowingMore}
      canToggleShowMore={canToggleShowMore}
    />,
    containerNode
  );
};

/**
 * The hierarchical menu widget is used to create a navigation based on a hierarchy of facet attributes.
 *
 * It is commonly used for categories with subcategories.
 *
 * All attributes (lvl0, lvl1 here) must be declared as [attributes for faceting](https://www.algolia.com/doc/guides/searching/faceting/#declaring-attributes-for-faceting) in your
 * Algolia settings.
 *
 * By default, the separator we expect is ` > ` (with spaces) but you can use
 * a different one by using the `separator` option.
 * @requirements
 * Your objects must be formatted in a specific way to be
 * able to display hierarchical menus. Here's an example:
 *
 * ```javascript
 * {
 *   "objectID": "123",
 *   "name": "orange",
 *   "categories": {
 *     "lvl0": "fruits",
 *     "lvl1": "fruits > citrus"
 *   }
 * }
 * ```
 *
 * Every level must be specified entirely.
 * It's also possible to have multiple values per level, for example:
 *
 * ```javascript
 * {
 *   "objectID": "123",
 *   "name": "orange",
 *   "categories": {
 *     "lvl0": ["fruits", "vitamins"],
 *     "lvl1": ["fruits > citrus", "vitamins > C"]
 *   }
 * }
 * ```
 * @type {WidgetFactory}
 * @devNovel HierarchicalMenu
 * @category filter
 * @param {HierarchicalMenuWidgetParams} widgetParams The HierarchicalMenu widget options.
 * @return {Widget} A new HierarchicalMenu widget instance.
 * @example
 * search.addWidgets([
 *   instantsearch.widgets.hierarchicalMenu({
 *     container: '#hierarchical-categories',
 *     attributes: ['hierarchicalCategories.lvl0', 'hierarchicalCategories.lvl1', 'hierarchicalCategories.lvl2'],
 *   })
 * ]);
 */
export type HierarchicalMenuWidget = WidgetFactory<
  HierarchicalMenuWidgetDescription & { $$widgetType: 'ais.hierarchicalMenu' },
  HierarchicalMenuConnectorParams,
  HierarchicalMenuWidgetParams
>;

const hierarchicalMenu: HierarchicalMenuWidget = function hierarchicalMenu(
  widgetParams
) {
  const {
    container,
    attributes,
    separator,
    rootPath,
    showParentLevel,
    limit,
    showMore = false,
    showMoreLimit,
    sortBy,
    transformItems,
    templates = defaultTemplates,
    cssClasses: userCssClasses = {},
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
    childList: cx(
      suit({ descendantName: 'list', modifierName: 'child' }),
      userCssClasses.childList
    ),
    item: cx(suit({ descendantName: 'item' }), userCssClasses.item),
    selectedItem: cx(
      suit({ descendantName: 'item', modifierName: 'selected' }),
      userCssClasses.selectedItem
    ),
    parentItem: cx(
      suit({ descendantName: 'item', modifierName: 'parent' }),
      userCssClasses.parentItem
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
    cssClasses,
    containerNode,
    templates,
    showMore,
    renderState: {},
  });

  const makeWidget = connectHierarchicalMenu(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget({
      attributes,
      separator,
      rootPath,
      showParentLevel,
      limit,
      showMore,
      showMoreLimit,
      sortBy,
      transformItems,
    }),
    $$widgetType: 'ais.hierarchicalMenu',
  };
};

export default hierarchicalMenu;
