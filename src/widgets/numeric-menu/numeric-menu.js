/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import RefinementList from '../../components/RefinementList/RefinementList';
import connectNumericMenu from '../../connectors/numeric-menu/connectNumericMenu';
import defaultTemplates from './defaultTemplates';
import {
  prepareTemplateProps,
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';

const withUsage = createDocumentationMessageGenerator({ name: 'numeric-menu' });
const suit = component('NumericMenu');

const renderer = ({
  containerNode,
  attribute,
  cssClasses,
  renderState,
  templates,
}) => (
  { createURL, instantSearchInstance, refine, items },
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
    <RefinementList
      createURL={createURL}
      cssClasses={cssClasses}
      facetValues={items}
      templateProps={renderState.templateProps}
      toggleRefinement={refine}
      attribute={attribute}
    />,
    containerNode
  );
};

/**
 * @typedef {Object} NumericMenuCSSClasses
 * @property {string|string[]} [root] CSS class to add to the root element.
 * @property {string|string[]} [noRefinementRoot] CSS class to add to the root element when no refinements.
 * @property {string|string[]} [list] CSS class to add to the list element.
 * @property {string|string[]} [item] CSS class to add to each item element.
 * @property {string|string[]} [selectedItem] CSS class to add to each selected item element.
 * @property {string|string[]} [label] CSS class to add to each label element.
 * @property {string|string[]} [labelText] CSS class to add to each label text element.
 * @property {string|string[]} [radio] CSS class to add to each radio element (when using the default template).
 */

/**
 * @typedef {Object} NumericMenuTemplates
 * @property {string|function} [item] Item template, provided with `label` (the name in the configuration), `isRefined`, `url`, `value` (the setting for the filter) data properties.
 */

/**
 * @typedef {Object} NumericMenuOption
 * @property {string} label Label of the option.
 * @property {number} [start] Low bound of the option (>=).
 * @property {number} [end] High bound of the option (<=).
 */

/**
 * @typedef {Object} NumericMenuWidgetOptions
 * @property {string|HTMLElement} container CSS Selector or HTMLElement to insert the widget.
 * @property {string} attribute Name of the attribute for filtering.
 * @property {NumericMenuOption[]} items List of all the items.
 * @property {NumericMenuTemplates} [templates] Templates to use for the widget.
 * @property {NumericMenuCSSClasses} [cssClasses] CSS classes to add to the wrapping elements.
 * @property {function(object[]):object[]} [transformItems] Function to transform the items passed to the templates.
 */

/**
 * The numeric menu is a widget that displays a list of numeric filters in a list. Those numeric filters
 * are pre-configured with creating the widget.
 *
 * @requirements
 * The attribute passed to `attribute` must be declared as an [attribute for faceting](https://www.algolia.com/doc/guides/searching/faceting/#declaring-attributes-for-faceting) in your
 * Algolia settings.
 *
 * The values inside this attribute must be JavaScript numbers and not strings.
 *
 * @type {WidgetFactory}
 * @devNovel NumericMenu
 * @category filter
 * @param {NumericMenuWidgetOptions} $0 The NumericMenu widget items
 * @return {Widget} Creates a new instance of the NumericMenu widget.
 * @example
 * search.addWidgets([
 *   instantsearch.widgets.numericMenu({
 *     container: '#popularity',
 *     attribute: 'popularity',
 *     items: [
 *       { label: 'All' },
 *       { end: 500, label: 'less than 500' },
 *       { start: 500, end: 2000, label: 'between 500 and 2000' },
 *       { start: 2000, label: 'more than 2000' }
 *     ]
 *   })
 * ]);
 */
export default function numericMenu({
  container,
  attribute,
  items,
  cssClasses: userCssClasses = {},
  templates = defaultTemplates,
  transformItems,
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
    label: cx(suit({ descendantName: 'label' }), userCssClasses.label),
    radio: cx(suit({ descendantName: 'radio' }), userCssClasses.radio),
    labelText: cx(
      suit({ descendantName: 'labelText' }),
      userCssClasses.labelText
    ),
  };

  const specializedRenderer = renderer({
    containerNode,
    attribute,
    cssClasses,
    renderState: {},
    templates,
  });

  const makeNumericMenu = connectNumericMenu(specializedRenderer, () =>
    render(null, containerNode)
  );

  return makeNumericMenu({
    attribute,
    items,
    transformItems,
  });
}
