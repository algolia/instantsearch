/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import connectMenu from '../../connectors/menu/connectMenu';
import MenuSelect from '../../components/MenuSelect/MenuSelect';
import defaultTemplates from './defaultTemplates';
import {
  prepareTemplateProps,
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';

const withUsage = createDocumentationMessageGenerator({ name: 'menu-select' });
const suit = component('MenuSelect');

const renderer = ({ containerNode, cssClasses, renderState, templates }) => (
  { refine, items, canRefine, instantSearchInstance },
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
    <MenuSelect
      cssClasses={cssClasses}
      items={items}
      refine={refine}
      templateProps={renderState.templateProps}
      canRefine={canRefine}
    />,
    containerNode
  );
};

/**
 * @typedef {Object} MenuSelectCSSClasses
 * @property {string|string[]} [root] CSS class to add to the root element.
 * @property {string|string[]} [noRefinementRoot] CSS class to add to the root when there are no items to display
 * @property {string|string[]} [select] CSS class to add to the select element.
 * @property {string|string[]} [option] CSS class to add to the option element.
 *
 */

/**
 * @typedef {Object} MenuSelectTemplates
 * @property {string|function(label: string, count: number, isRefined: boolean, value: string)} [item] Item template, provided with `label`, `count`, `isRefined` and `value` data properties.
 * @property {string} [defaultOption = 'See all'] Label of the "see all" option in the select.
 */

/**
 * @typedef {Object} MenuSelectWidgetOptions
 * @property {string|HTMLElement} container CSS Selector or HTMLElement to insert the widget.
 * @property {string} attribute Name of the attribute for faceting
 * @property {string[]|function} [sortBy=['name:asc']] How to sort refinements. Possible values: `count|isRefined|name:asc|name:desc`.
 *
 * You can also use a sort function that behaves like the standard Javascript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax).
 * @property {MenuSelectTemplates} [templates] Customize the output through templating.
 * @property {number} [limit=10] How many facets values to retrieve.
 * @property {MenuSelectCSSClasses} [cssClasses] CSS classes to add to the wrapping elements.
 * @property {function(object[]):object[]} [transformItems] Function to transform the items passed to the templates.
 */

/**
 * Create a menu select out of a facet
 * @type {WidgetFactory}
 * @category filter
 * @param {MenuSelectWidgetOptions} $0 The Menu select widget options.
 * @return {Widget} Creates a new instance of the Menu select widget.
 * @example
 * search.addWidgets([
 *   instantsearch.widgets.menuSelect({
 *     container: '#categories-menuSelect',
 *     attribute: 'hierarchicalCategories.lvl0',
 *     limit: 10,
 *   })
 * ]);
 */
export default function menuSelect({
  container,
  attribute,
  sortBy = ['name:asc'],
  limit = 10,
  cssClasses: userCssClasses = {},
  templates = defaultTemplates,
  transformItems,
}) {
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
    select: cx(suit({ descendantName: 'select' }), userCssClasses.select),
    option: cx(suit({ descendantName: 'option' }), userCssClasses.option),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    renderState: {},
    templates,
  });

  const makeWidget = connectMenu(specializedRenderer, () =>
    render(null, containerNode)
  );

  return makeWidget({ attribute, limit, sortBy, transformItems });
}
