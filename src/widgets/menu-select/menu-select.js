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
  [ cssClasses.{select, option, panelRoot, panelHeader, panelBody, panelFooter} ]
  [ templates.{item, panelHeader, panelFooter, seeAllOption} ],
  [ transformData.{item} ],
  [ autoHideContainer ]
})`;

/**
 * @typedef {Object} MenuSelectCSSClasses
 * @property {string|string[]} [select] CSS class to add to the select element.
 * @property {string|string[]} [option] CSS class to add to the option element.
 * @property {string|string[]} [panelRoot] CSS class to add to the root panel element
 * @property {string|string[]} [panelHeader] CSS class to add to the header panel element
 * @property {string|string[]} [panelBody] CSS class to add to the body panel element
 * @property {string|string[]} [panelFooter] CSS class to add to the footer panel element
 */

/**
 * @typedef {Object} MenuSelectTemplates
 * @property {string|function(label: string, count: number, isRefined: boolean, value: string)} [item] Item template, provided with `label`, `count`, `isRefined` and `value` data properties.
 * @property {string} [seeAllOption='See all'] Label of the see all option in the select.
 * @property {string|function():string} [panelHeader=''] Template used for the header of the panel.
 * @property {string|function():string} [panelFooter=''] Template used for the footer of the panel.
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
 *       panelHeader: 'Categories'
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
    select: cx(bem('select'), userCssClasses.select),
    option: cx(bem('option'), userCssClasses.option),
    panelRoot: userCssClasses.panelRoot,
    panelHeader: userCssClasses.panelHeader,
    panelBody: userCssClasses.panelBody,
    panelFooter: userCssClasses.panelFooter,
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
