import React, { render, unmountComponentAtNode } from 'preact-compat';
import cx from 'classnames';

import defaultTemplates from './defaultTemplates';
import RefinementList from '../../components/RefinementList/RefinementList';
import connectToggle from '../../connectors/toggle/connectToggle';

import {
  bemHelper,
  getContainerNode,
  prepareTemplateProps,
} from '../../lib/utils';

const bem = bemHelper('ais-toggle');

const renderer = ({
  containerNode,
  cssClasses,
  collapsible,
  autoHideContainer,
  renderState,
  templates,
  transformData,
}) => (
  { value, createURL, refine, instantSearchInstance },
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

  const shouldAutoHideContainer =
    autoHideContainer && (value.count === 0 || value.count === null);

  render(
    <RefinementList
      collapsible={collapsible}
      createURL={createURL}
      cssClasses={cssClasses}
      facetValues={[value]}
      shouldAutoHideContainer={shouldAutoHideContainer}
      templateProps={renderState.templateProps}
      toggleRefinement={(name, isRefined) => refine({ isRefined })}
    />,
    containerNode
  );
};

const usage = `Usage:
toggle({
  container,
  attributeName,
  label,
  [ values={on: true, off: undefined} ],
  [ cssClasses.{root,header,body,footer,list,item,active,label,checkbox,count} ],
  [ templates.{header,item,footer} ],
  [ transformData.{item} ],
  [ autoHideContainer=true ],
  [ collapsible=false ]
})`;

/**
 * @typedef {Object} ToggleWidgetCSSClasses
 * @property  {string|string[]} [root] CSS class to add to the root element.
 * @property  {string|string[]} [header] CSS class to add to the header element.
 * @property  {string|string[]} [body] CSS class to add to the body element.
 * @property  {string|string[]} [footer] CSS class to add to the footer element.
 * @property  {string|string[]} [list] CSS class to add to the list element.
 * @property  {string|string[]} [item] CSS class to add to each item element.
 * @property  {string|string[]} [active] CSS class to add to each active element.
 * @property  {string|string[]} [label] CSS class to add to each
 * label element (when using the default template).
 * @property  {string|string[]} [checkbox] CSS class to add to each
 * checkbox element (when using the default template).
 * @property  {string|string[]} [count] CSS class to add to each count.
 */

/**
 * @typedef {Object} ToggleWidgetTransforms
 * @property  {function(Object):Object} item Function to change the object passed to the `item`. template
 */

/**
 * @typedef {Object} ToggleWidgetTemplates
 * @property  {string|function} header Header template.
 * @property  {string|function} item Item template, provided with `name`, `count`, `isRefined`, `url` data properties.
 * count is always the number of hits that would be shown if you toggle the widget. We also provide
 * `onFacetValue` and `offFacetValue` objects with according counts.
 * @property  {string|function} footer Footer template.
 */

/**
 * @typedef {Object} ToggleWidgetValues
 * @property  {string|number|boolean} on Value to filter on when checked.
 * @property  {string|number|boolean} off Value to filter on when unchecked.
 * element (when using the default template). By default when switching to `off`, no refinement will be asked. So you
 * will get both `true` and `false` results. If you set the off value to `false` then you will get only objects
 * having `false` has a value for the selected attribute.
 */

/**
 * @typedef {Object} ToggleWidgetCollapsibleOption
 * @property {boolean} collapsed If set to true, the widget will be collapsed at first rendering.
 */

/**
 * @typedef {Object} ToggleWidgetOptions
 * @property {string|HTMLElement} container Place where to insert the widget in your webpage.
 * @property {string} attributeName Name of the attribute for faceting (eg. "free_shipping").
 * @property {string} label Human-readable name of the filter (eg. "Free Shipping").
 * @property {ToggleWidgetValues} [values={on: true, off: undefined}] Values that the widget can set.
 * @property {ToggleWidgetTemplates} [templates] Templates to use for the widget.
 * @property {ToggleWidgetTransforms} [transformData] Object that contains the functions to be applied on the data * before being used for templating. Valid keys are `body` for the body template.
 * @property {boolean} [autoHideContainer=true] Make the widget hides itself when there is no results matching.
 * @property {ToggleWidgetCSSClasses} [cssClasses] CSS classes to add.
 * @property {boolean|ToggleWidgetCollapsibleOption} collapsible If set to true, the widget can be collapsed. This parameter can also be
 * an object, with the property collapsed, if you want the toggle to be collapsed initially.
 */

/**
 * The toggle widget lets the user either:
 *  - switch between two values for a single facetted attribute (free_shipping / not_free_shipping)
 *  - toggle a faceted value on and off (only 'canon' for brands)
 *
 * This widget is particularly useful if you have a boolean value in the records.
 *
 * @requirements
 * The attribute passed to `attributeName` must be declared as an
 * [attribute for faceting](https://www.algolia.com/doc/guides/searching/faceting/#declaring-attributes-for-faceting)
 * in your Algolia settings.
 *
 * @type {WidgetFactory}
 * @devNovel Toggle
 * @category filter
 * @param {ToggleWidgetOptions} $0 Options for the Toggle widget.
 * @return {Widget} A new instance of the Toggle widget
 * @example
 * search.addWidget(
 *   instantsearch.widgets.toggle({
 *     container: '#free-shipping',
 *     attributeName: 'free_shipping',
 *     label: 'Free Shipping',
 *     values: {
 *       on: true,
 *     },
 *     templates: {
 *       header: 'Shipping'
 *     }
 *   })
 * );
 */
export default function toggle({
  container,
  attributeName,
  label,
  cssClasses: userCssClasses = {},
  templates = defaultTemplates,
  transformData,
  autoHideContainer = true,
  collapsible = false,
  values: userValues = { on: true, off: undefined },
} = {}) {
  if (!container) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);

  const cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    header: cx(bem('header'), userCssClasses.header),
    body: cx(bem('body'), userCssClasses.body),
    footer: cx(bem('footer'), userCssClasses.footer),
    list: cx(bem('list'), userCssClasses.list),
    item: cx(bem('item'), userCssClasses.item),
    active: cx(bem('item', 'active'), userCssClasses.active),
    label: cx(bem('label'), userCssClasses.label),
    checkbox: cx(bem('checkbox'), userCssClasses.checkbox),
    count: cx(bem('count'), userCssClasses.count),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    collapsible,
    autoHideContainer,
    renderState: {},
    templates,
    transformData,
  });

  try {
    const makeWidget = connectToggle(specializedRenderer, () =>
      unmountComponentAtNode(containerNode)
    );
    return makeWidget({ attributeName, label, values: userValues });
  } catch (e) {
    throw new Error(usage);
  }
}
