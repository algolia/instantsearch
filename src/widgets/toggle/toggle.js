import React from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';

import defaultTemplates from './defaultTemplates.js';
import RefinementList from '../../components/RefinementList/RefinementList.js';
import connectToggle from '../../connectors/toggle/connectToggle.js';

import {
  bemHelper,
  getContainerNode,
  prepareTemplateProps,
} from '../../lib/utils.js';

const bem = bemHelper('ais-toggle');

const renderer = ({
  containerNode,
  cssClasses,
  collapsible,
  autoHideContainer,
  renderState,
  templates,
  transformData,
}) => ({
  value,
  createURL,
  refine,
  instantSearchInstance,
}, isFirstRendering) => {
  if (isFirstRendering) {
    renderState.templateProps = prepareTemplateProps({
      transformData,
      defaultTemplates,
      templatesConfig: instantSearchInstance.templatesConfig,
      templates,
    });
    return;
  }

  const shouldAutoHideContainer = autoHideContainer && (value.count === 0 || value.count === null);

  ReactDOM.render(
    <RefinementList
      collapsible={collapsible}
      createURL={createURL}
      cssClasses={cssClasses}
      facetValues={[value]}
      shouldAutoHideContainer={shouldAutoHideContainer}
      templateProps={renderState.templateProps}
      toggleRefinement={(name, isRefined) => refine({isRefined})}
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
 * Instantiate the toggling of a boolean facet filter on and off.
 * @type {WidgetFactory}
 * @param  {string|DOMElement} $0.container CSS Selector or DOMElement to insert the widget
 * @param  {string} $0.attributeName Name of the attribute for faceting (eg. "free_shipping")
 * @param  {string} $0.label Human-readable name of the filter (eg. "Free Shipping")
 * @param  {Object} [$0.values] Lets you define the values to filter on when toggling
 * @param  {string|number|boolean} [$0.values.on=true] Value to filter on when checked
 * @param  {string|number|boolean} [$0.values.off=undefined] Value to filter on when unchecked
 * element (when using the default template). By default when switching to `off`, no refinement will be asked. So you
 * will get both `true` and `false` results. If you set the off value to `false` then you will get only objects
 * having `false` has a value for the selected attribute.
 * @param  {Object} [$0.templates] Templates to use for the widget
 * @param  {string|Function} [$0.templates.header] Header template
 * @param  {string|Function} [$0.templates.item] Item template, provided with `name`, `count`, `isRefined`, `url` data properties
 * count is always the number of hits that would be shown if you toggle the widget. We also provide
 * `onFacetValue` and `offFacetValue` objects with according counts.
 * @param  {string|Function} [$0.templates.footer] Footer template
 * @param  {Function} [$0.transformData.item] Function to change the object passed to the `item` template
 * @param  {boolean} [$0.autoHideContainer=true] Hide the container when there are no results
 * @param  {Object} [$0.cssClasses] CSS classes to add
 * @param  {string|string[]} [$0.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [$0.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [$0.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [$0.cssClasses.footer] CSS class to add to the footer element
 * @param  {string|string[]} [$0.cssClasses.list] CSS class to add to the list element
 * @param  {string|string[]} [$0.cssClasses.item] CSS class to add to each item element
 * @param  {string|string[]} [$0.cssClasses.active] CSS class to add to each active element
 * @param  {string|string[]} [$0.cssClasses.label] CSS class to add to each
 * label element (when using the default template)
 * @param  {string|string[]} [$0.cssClasses.checkbox] CSS class to add to each
 * checkbox element (when using the default template)
 * @param  {string|string[]} [$0.cssClasses.count] CSS class to add to each count
 * @param  {object|boolean} [$0.collapsible=false] Hide the widget body and footer when clicking on header
 * @param  {boolean} [$0.collapsible.collapsed] Initial collapsed state of a collapsible widget
 * @return {Object} widget
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
  values: userValues = {on: true, off: undefined},
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
    const makeWidget = connectToggle(specializedRenderer);
    return makeWidget({attributeName, label, values: userValues});
  } catch (e) {
    throw new Error(usage);
  }
}
