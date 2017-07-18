import React from 'react';
import ReactDOM from 'react-dom';
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

  ReactDOM.render(
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
  [ showParentLevel=true ],
  [ limit=10 ],
  [ sortBy=['name:asc'] ],
  [ cssClasses.{root , header, body, footer, list, depth, item, active, link}={} ],
  [ templates.{header, item, footer} ],
  [ transformData.{item} ],
  [ autoHideContainer=true ],
  [ collapsible=false ]
})`;
/**
 * @typedef {Object} HierarchicalMenuCSSClasses
 * @property {string|string[]} [root] CSS class to add to the root element.
 * @property {string|string[]} [header] CSS class to add to the header element.
 * @property {string|string[]} [body] CSS class to add to the body element.
 * @property {string|string[]} [footer] CSS class to add to the footer element.
 * @property {string|string[]} [list] CSS class to add to the list element.
 * @property {string|string[]} [item] CSS class to add to each item element.
 * @property {string|string[]} [depth] CSS class to add to each item element to denote its depth. The actual level will be appended to the given class name (ie. if `depth` is given, the widget will add `depth0`, `depth1`, ... according to the level of each item).
 * @property {string|string[]} [active] CSS class to add to each active element.
 * @property {string|string[]} [link] CSS class to add to each link (when using the default template).
 * @property {string|string[]} [count] CSS class to add to each count element (when using the default template).
 */

/**
 * @typedef {Object} HierarchicalMenuTemplates
 * @property {string|function(object):string} [header=''] Header template (root level only).
 * @property {string|function(object):string} [item] Item template, provided with `name`, `count`, `isRefined`, `url` data properties.
 * @property {string|function(object):string} [footer=''] Footer template (root level only).
 */

/**
 * @typedef {Object} HierarchicalMenuTransforms
 * @property {function(object):object} [item] Method to change the object passed to the `item`. template
 */

/**
 * @typedef {Object} HierarchicalMenuWidgetOptions
 * @property {string|HTMLElement} container CSS Selector or HTMLElement to insert the widget.
 * @property {string[]} attributes Array of attributes to use to generate the hierarchy of the menu.
 * @property {number} [limit=10] How much facet values to get [*].
 * @property {string} [separator=" > "] Separator used in the attributes to separate level values. [*].
 * @property {string} [rootPath] Prefix path to use if the first level is not the root level.
 * @property {string} [showParentLevel=false] Show the parent level of the current refined value.
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
 * This widget requires the data to be formatted in a specific way. Each level should be represented
 * as a single attribute. Each attribute represent a path in the hierarchy. Example:
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
 * By default, the separator is ` > ` but it can be different and specified with the `separator` option.
 * @type {WidgetFactory}
 * @param {HierarchicalMenuWidgetOptions} $0 The HierarchicalMenu widget options.
 * @return {Widget} A new HierarchicalMenu widget instance.
 * @example
 * search.addWidget(
 *   instantsearch.widgets.hierarchicalMenu({
 *     container: '#hierarchical-categories',
 *     attributes: ['hierarchicalCategories.lvl0', 'hierarchicalCategories.lvl1', 'hierarchicalCategories.lvl2'],
 *     templates: {
 *       header: 'Hierarchical categories'
 *     }
 *   })
 * );
 */
export default function hierarchicalMenu(
  {
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
  } = {}
) {
  if (!container || !attributes || !attributes.length) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);

  const cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    header: cx(bem('header'), userCssClasses.header),
    body: cx(bem('body'), userCssClasses.body),
    footer: cx(bem('footer'), userCssClasses.footer),
    list: cx(bem('list'), userCssClasses.list),
    depth: bem('list', 'lvl'),
    item: cx(bem('item'), userCssClasses.item),
    active: cx(bem('item', 'active'), userCssClasses.active),
    link: cx(bem('link'), userCssClasses.link),
    count: cx(bem('count'), userCssClasses.count),
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
    const makeHierarchicalMenu = connectHierarchicalMenu(specializedRenderer);
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
