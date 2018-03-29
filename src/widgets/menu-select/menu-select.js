import React, { render } from 'preact-compat';
import cx from 'classnames';

import connectMenu from '../../connectors/menu/connectMenu';
import defaultTemplates from './defaultTemplates';
import MenuSelect from '../../components/MenuSelect';

import {
  bemHelper,
  prepareTemplateProps,
  getContainerNode,
} from '../../lib/utils';

const bem = bemHelper('ais-menu-select');

const renderer = ({
  containerNode,
  cssClasses,
  autoHideContainer,
  renderState,
  templates,
  transformData,
}) => (
  { refine, items, canRefine, instantSearchInstance },
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

  const shouldAutoHideContainer = autoHideContainer && !canRefine;

  render(
    <MenuSelect
      cssClasses={cssClasses}
      items={items}
      refine={refine}
      templateProps={renderState.templateProps}
      shouldAutoHideContainer={shouldAutoHideContainer}
      canRefine={canRefine}
    />,
    containerNode
  );
};

const usage = `Usage:
menuSelect({
  container,
  attributeName,
  [ sortBy=['name:asc'] ],
  [ limit=10 ],
  [ cssClasses.{root,select,option,header,footer} ]
  [ templates.{header,item,footer,seeAllOption} ],
  [ transformData.{item} ],
  [ autoHideContainer ]
})`;

/**
 * @typedef {Object} MenuSelectCSSClasses
 * @property {string|string[]} [root] CSS class to add to the root element.
 * @property {string|string[]} [header] CSS class to add to the header element.
 * @property {string|string[]} [select] CSS class to add to the select element.
 * @property {string|string[]} [option] CSS class to add to the option element.
 * @property {string|string[]} [footer] CSS class to add to the footer element.
 */

/**
 * @typedef {Object} MenuSelectTemplates
 * @property {string|function} [header] Header template.
 * @property {string|function(label: string, count: number, isRefined: boolean, value: string)} [item] Item template, provided with `label`, `count`, `isRefined` and `value` data properties.
 * @property {string} [seeAllOption='See all'] Label of the see all option in the select.
 * @property {string|function} [footer] Footer template.
 */

/**
 * @typedef {Object} MenuSelectTransforms
 * @property {function} [item] Method to change the object passed to the `item` template.
 */

/**
 * @typedef {Object} MenuSelectWidgetOptions
 * @property {string|HTMLElement} container CSS Selector or HTMLElement to insert the widget.
 * @property {string} attributeName Name of the attribute for faceting
 * @property {string[]|function} [sortBy=['name:asc']] How to sort refinements. Possible values: `count|isRefined|name:asc|name:desc`.
 *
 * You can also use a sort function that behaves like the standard Javascript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax).
 * @property {MenuSelectTemplates} [templates] Customize the output through templating.
 * @property {string} [limit=10] How many facets values to retrieve.
 * @property {MenuSelectTransforms} [transformData] Set of functions to update the data before passing them to the templates.
 * @property {boolean} [autoHideContainer=true] Hide the container when there are no items in the menu select.
 * @property {MenuSelectCSSClasses} [cssClasses] CSS classes to add to the wrapping elements.
 */

/**
 * Create a menu select out of a facet
 * @type {WidgetFactory}
 * @category filter
 * @param {MenuSelectWidgetOptions} $0 The Menu select widget options.
 * @return {Widget} Creates a new instance of the Menu select widget.
 * @example
 * search.addWidget(
 *   instantsearch.widgets.menuSelect({
 *     container: '#categories-menuSelect',
 *     attributeName: 'hierarchicalCategories.lvl0',
 *     limit: 10,
 *     templates: {
 *       header: 'Categories'
 *     }
 *   })
 * );
 */
export default function menuSelect({
  container,
  attributeName,
  sortBy = ['name:asc'],
  limit = 10,
  cssClasses: userCssClasses = {},
  templates = defaultTemplates,
  transformData,
  autoHideContainer = true,
}) {
  if (!container || !attributeName) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);
  const cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    header: cx(bem('header'), userCssClasses.header),
    footer: cx(bem('footer'), userCssClasses.footer),
    select: cx(bem('select'), userCssClasses.select),
    option: cx(bem('option'), userCssClasses.option),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    autoHideContainer,
    renderState: {},
    templates,
    transformData,
  });

  try {
    const makeWidget = connectMenu(specializedRenderer);
    return makeWidget({ attributeName, limit, sortBy });
  } catch (e) {
    throw new Error(usage);
  }
}
