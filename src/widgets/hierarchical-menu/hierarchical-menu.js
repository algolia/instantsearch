import React, { render, unmountComponentAtNode } from 'preact-compat';
import cx from 'classnames';

import connectHierarchicalMenu from '../../connectors/hierarchical-menu/connectHierarchicalMenu';
import RefinementList from '../../components/RefinementList/RefinementList.js';
import defaultTemplates from './defaultTemplates.js';

import {
  bemHelper,
  prepareTemplateProps,
  getContainerNode,
} from '../../lib/utils.js';

const bem = bemHelper('ais-hierarchical-menu');

const renderer = ({
  autoHideContainer,
  collapsible,
  cssClasses,
  containerNode,
  transformData,
  templates,
  renderState,
}) => (
  { createURL, items, refine, instantSearchInstance },
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

  const shouldAutoHideContainer = autoHideContainer && items.length === 0;

  render(
    <RefinementList
      collapsible={collapsible}
      createURL={createURL}
      cssClasses={cssClasses}
      facetValues={items}
      shouldAutoHideContainer={shouldAutoHideContainer}
      templateProps={renderState.templateProps}
      toggleRefinement={refine}
    />,
    containerNode
  );
};

const usage = `Usage:
hierarchicalMenu({
  container,
  attributes,
  [ separator=' > ' ],
  [ rootPath ],
  [ showParentLevel=false ],
  [ limit=10 ],
  [ sortBy=['name:asc'] ],
  [ cssClasses.{list, depth, item, active, link, panelRoot , panelHeader, panelBody, panelFooter, }={} ],
  [ templates.{item, panelHeader, panelFooter} ],
  [ transformData.{item} ],
  [ autoHideContainer=true ],
  [ collapsible=false ]
})`;
/**
 * @typedef {Object} HierarchicalMenuCSSClasses
 * @property {string|string[]} [list] CSS class to add to the list element.
 * @property {string|string[]} [item] CSS class to add to each item element.
 * @property {string|string[]} [depth] CSS class to add to each item element to denote its depth. The actual level will be appended to the given class name (ie. if `depth` is given, the widget will add `depth0`, `depth1`, ... according to the level of each item).
 * @property {string|string[]} [active] CSS class to add to each active element.
 * @property {string|string[]} [link] CSS class to add to each link (when using the default template).
 * @property {string|string[]} [count] CSS class to add to each count element (when using the default template).
 * @property {string|string[]} [panelRoot] CSS class to add to the panel root element.
 * @property {string|string[]} [panelHeader] CSS class to add to the panel header element.
 * @property {string|string[]} [panelBody] CSS class to add to the panel body element.
 * @property {string|string[]} [panelFooter] CSS class to add to the panel footer element.
 */

/**
 * @typedef {Object} HierarchicalMenuTemplates
 * @property {string|function(object):string} [item] Item template, provided with `name`, `count`, `isRefined`, `url` data properties.
 * @property {string|function(object):string} [panelHeader=''] Header panel template
 * @property {string|function(object):string} [panelFooter=''] Footer panel template
 */

/**
 * @typedef {Object} HierarchicalMenuTransforms
 * @property {function(object):object} [item] Method to change the object passed to the `item`. template
 */

/**
 * @typedef {Object} HierarchicalMenuWidgetOptions
 * @property {string|HTMLElement} container CSS Selector or HTMLElement to insert the widget.
 * @property {string[]} attributes Array of attributes to use to generate the hierarchy of the menu.
 * @property {number} [limit=10] How much facet values to get.
 * @property {string} [separator=" > "] Separator used in the attributes to separate level values.
 * @property {string} [rootPath] Prefix path to use if the first level is not the root level.
 * @property {boolean} [showParentLevel=true] Show the siblings of the selected parent level of the current refined value. This
 * does not impact the root level.
 *
 * The hierarchical menu is able to show or hide the siblings with `showParentLevel`.
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
 * @property {string[]|function} [sortBy=['name:asc']] How to sort refinements. Possible values: `count|isRefined|name:asc|name:desc`.
 *
 * You can also use a sort function that behaves like the standard Javascript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax).
 * @property {HierarchicalMenuTemplates} [templates] Templates to use for the widget.
 * @property {HierarchicalMenuTransforms} [transformData] Set of functions to transform the data passed to the templates.
 * @property {boolean} [autoHideContainer=true] Hide the container when there are no items in the menu.
 * @property {HierarchicalMenuCSSClasses} [cssClasses] CSS classes to add to the wrapping elements.
 * @property {boolean|{collapsed: boolean}} [collapsible=false] Makes the widget collapsible. The user can then
 * choose to hide the content of the widget. This option can also be an object with the property collapsed. If this
 * property is `true`, then the widget is hidden during the first rendering.
 */

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
 * @param {HierarchicalMenuWidgetOptions} $0 The HierarchicalMenu widget options.
 * @return {Widget} A new HierarchicalMenu widget instance.
 * @example
 * search.addWidget(
 *   instantsearch.widgets.hierarchicalMenu({
 *     container: '#hierarchical-categories',
 *     attributes: ['hierarchicalCategories.lvl0', 'hierarchicalCategories.lvl1', 'hierarchicalCategories.lvl2'],
 *     templates: {
 *       panelHeader: 'Hierarchical categories'
 *     }
 *   })
 * );
 */
export default function hierarchicalMenu({
  container,
  attributes,
  separator = ' > ',
  rootPath = null,
  showParentLevel = true,
  limit = 10,
  sortBy = ['name:asc'],
  cssClasses: userCssClasses = {},
  autoHideContainer = true,
  templates = defaultTemplates,
  collapsible = false,
  transformData,
} = {}) {
  if (!container || !attributes || !attributes.length) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);

  const cssClasses = {
    list: cx(bem('list'), userCssClasses.list),
    depth: bem('list', 'lvl'),
    item: cx(bem('item'), userCssClasses.item),
    active: cx(bem('item', 'active'), userCssClasses.active),
    link: cx(bem('link'), userCssClasses.link),
    count: cx(bem('count'), userCssClasses.count),
    panelRoot: userCssClasses.panelRoot,
    panelHeader: userCssClasses.panelHeader,
    panelBody: userCssClasses.panelBody,
    panelFooter: userCssClasses.panelFooter,
  };

  const specializedRenderer = renderer({
    autoHideContainer,
    collapsible,
    cssClasses,
    containerNode,
    transformData,
    templates,
    renderState: {},
  });

  try {
    const makeHierarchicalMenu = connectHierarchicalMenu(
      specializedRenderer,
      () => unmountComponentAtNode(containerNode)
    );
    return makeHierarchicalMenu({
      attributes,
      separator,
      rootPath,
      showParentLevel,
      limit,
      sortBy,
    });
  } catch (e) {
    throw new Error(usage);
  }
}
