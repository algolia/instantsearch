/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import connectBreadcrumb from '../../connectors/breadcrumb/connectBreadcrumb';
import defaultTemplates from './defaultTemplates';
import {
  getContainerNode,
  prepareTemplateProps,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';

const withUsage = createDocumentationMessageGenerator({ name: 'breadcrumb' });
const suit = component('Breadcrumb');

const renderer = ({ containerNode, cssClasses, renderState, templates }) => (
  { canRefine, createURL, instantSearchInstance, items, refine },
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
    <Breadcrumb
      canRefine={canRefine}
      cssClasses={cssClasses}
      createURL={createURL}
      items={items}
      refine={refine}
      templateProps={renderState.templateProps}
    />,
    containerNode
  );
};

/**
 * @typedef {Object} BreadcrumbCSSClasses
 * @property {string|string[]} [root] CSS class to add to the root element of the widget.
 * @property {string|string[]} [noRefinementRoot] CSS class to add to the root element of the widget if there are no refinements.
 * @property {string|string[]} [list] CSS class to add to the list element.
 * @property {string|string[]} [item] CSS class to add to the items of the list. The items contains the link and the separator.
 * @property {string|string[]} [selectedItem] CSS class to add to the selected item in the list: the last one or the home if there are no refinements.
 * @property {string|string[]} [separator] CSS class to add to the separator.
 * @property {string|string[]} [link] CSS class to add to the links in the items.
 */

/**
 * @typedef {Object} BreadcrumbTemplates
 * @property {string|function(object):string} [home = 'Home'] Label of the breadcrumb's first element.
 * @property {string|function(object):string} [separator = '>'] Symbol used to separate the elements of the breadcrumb.
 */

/**
 * @typedef {Object} BreadcrumbWidgetOptions
 * @property {string|HTMLElement} container CSS Selector or HTMLElement to insert the widget.
 * @property {string[]} attributes Array of attributes to use to generate the breadcrumb.
 * @property {string} [separator = ' > '] The level separator used in the records.
 * @property {string} [rootPath = null] Prefix path to use if the first level is not the root level.
 * @property {BreadcrumbTemplates} [templates] Templates to use for the widget.
 * @property {function(object[]):object[]} [transformItems] Function to transform the items passed to the templates.
 * @property {BreadcrumbCSSClasses} [cssClasses] CSS classes to add to the wrapping elements.
 */

/**
 * The breadcrumb widget is a secondary navigation scheme that allows the user to see where the current page is in relation to the facet's hierarchy.
 *
 * It reduces the number of actions a user needs to take in order to get to a higher-level page and improve the discoverability of the app or website's sections and pages.
 * It is commonly used for websites with a large amount of data organized into categories with subcategories.
 *
 * All attributes (lvl0, lvl1 in this case) must be declared as [attributes for faceting](https://www.algolia.com/doc/guides/searching/faceting/#declaring-attributes-for-faceting) in your
 * Algolia settings.
 *
 * @requirements
 * Your objects must be formatted in a specific way to be
 * able to display a breadcrumb. Here's an example:
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
 * Each level must be specified entirely.
 * It's also possible to have multiple values per level, for instance:
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
 * @devNovel Breadcrumb
 * @category navigation
 * @param {BreadcrumbWidgetOptions} $0 The Breadcrumb widget options.
 * @return {Widget} A new Breadcrumb widget instance.
 * @example
 * search.addWidgets([
 *   instantsearch.widgets.breadcrumb({
 *     container: '#breadcrumb',
 *     attributes: ['hierarchicalCategories.lvl0', 'hierarchicalCategories.lvl1', 'hierarchicalCategories.lvl2'],
 *     templates: { home: 'Home Page' },
 *     separator: ' / ',
 *     rootPath: 'Cameras & Camcorders > Digital Cameras',
 *   })
 * ]);
 */

export default function breadcrumb({
  container,
  attributes,
  separator,
  rootPath = null,
  transformItems,
  templates = defaultTemplates,
  cssClasses: userCssClasses = {},
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
    separator: cx(
      suit({ descendantName: 'separator' }),
      userCssClasses.separator
    ),
    link: cx(suit({ descendantName: 'link' }), userCssClasses.link),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    renderState: {},
    templates,
  });

  const makeBreadcrumb = connectBreadcrumb(specializedRenderer, () =>
    render(null, containerNode)
  );

  return makeBreadcrumb({ attributes, separator, rootPath, transformItems });
}
