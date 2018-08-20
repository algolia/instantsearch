import React, { render, unmountComponentAtNode } from 'preact-compat';
import cx from 'classnames';

import PriceRanges from '../../components/PriceRanges/PriceRanges';
import connectPriceRanges from '../../connectors/price-ranges/connectPriceRanges';
import defaultTemplates from './defaultTemplates';

import {
  bemHelper,
  prepareTemplateProps,
  getContainerNode,
} from '../../lib/utils';

const bem = bemHelper('ais-price-ranges');

const renderer = ({
  containerNode,
  templates,
  renderState,
  collapsible,
  cssClasses,
  labels,
  currency,
  autoHideContainer,
}) => ({ refine, items, instantSearchInstance }, isFirstRendering) => {
  if (isFirstRendering) {
    renderState.templateProps = prepareTemplateProps({
      defaultTemplates,
      templatesConfig: instantSearchInstance.templatesConfig,
      templates,
    });
    return;
  }

  const shouldAutoHideContainer = autoHideContainer && items.length === 0;

  render(
    <PriceRanges
      collapsible={collapsible}
      cssClasses={cssClasses}
      currency={currency}
      facetValues={items}
      labels={labels}
      refine={refine}
      shouldAutoHideContainer={shouldAutoHideContainer}
      templateProps={renderState.templateProps}
    />,
    containerNode
  );
};

const usage = `Usage:
priceRanges({
  container,
  attributeName,
  [ currency=$ ],
  [ cssClasses.{root,header,body,list,item,active,link,form,label,input,currency,separator,button,footer} ],
  [ templates.{header,item,footer} ],
  [ labels.{currency,separator,button} ],
  [ autoHideContainer=true ],
  [ collapsible=false ]
})`;

/**
 * @typedef {Object} PriceRangeClasses
 * @property  {string|string[]} [root] CSS class to add to the root element.
 * @property  {string|string[]} [header] CSS class to add to the header element.
 * @property  {string|string[]} [body] CSS class to add to the body element.
 * @property  {string|string[]} [list] CSS class to add to the wrapping list element.
 * @property  {string|string[]} [item] CSS class to add to each item element.
 * @property  {string|string[]} [active] CSS class to add to the active item element.
 * @property  {string|string[]} [link] CSS class to add to each link element.
 * @property  {string|string[]} [form] CSS class to add to the form element.
 * @property  {string|string[]} [label] CSS class to add to each wrapping label of the form.
 * @property  {string|string[]} [input] CSS class to add to each input of the form.
 * @property  {string|string[]} [currency] CSS class to add to each currency element of the form.
 * @property  {string|string[]} [separator] CSS class to add to the separator of the form.
 * @property  {string|string[]} [button] CSS class to add to the submit button of the form.
 * @property  {string|string[]} [footer] CSS class to add to the footer element.
 */

/**
 * @typedef {Object} PriceRangeLabels
 * @property  {string} [separator] Separator label, between min and max.
 * @property  {string} [button] Button label.
 */

/**
 * @typedef {Object} PriceRangeTemplates
 * @property  {string|function({from: number, to: number, currency: string})} [item] Item template. Template data: `from`, `to` and `currency`
 */

/**
 * @typedef {Object} PriceRangeWidgetOptions
 * @property  {string|HTMLElement} container Valid CSS Selector as a string or DOMElement.
 * @property  {string} attributeName Name of the attribute for faceting.
 * @property  {PriceRangeTemplates} [templates] Templates to use for the widget.
 * @property  {string} [currency='$'] The currency to display.
 * @property  {PriceRangeLabels} [labels] Labels to use for the widget.
 * @property  {boolean} [autoHideContainer=true] Hide the container when no refinements available.
 * @property  {PriceRangeClasses} [cssClasses] CSS classes to add.
 * @property  {boolean|{collapsed: boolean}} [collapsible=false] Hide the widget body and footer when clicking on header.
 */

/**
 * Price ranges widget lets the user choose from of a set of predefined ranges. The ranges are
 * displayed in a list.
 *
 * @requirements
 * The attribute passed to `attributeName` must be declared as an
 * [attribute for faceting](https://www.algolia.com/doc/guides/searching/faceting/#declaring-attributes-for-faceting)
 * in your Algolia settings.
 *
 * The values inside this attribute must be JavaScript numbers (not strings).
 * @type {WidgetFactory}
 * @devNovel PriceRanges
 * @category filter
 * @param {PriceRangeWidgetOptions} $0 The PriceRanges widget options.
 * @return {Widget} A new instance of PriceRanges widget.
 * @example
 * search.addWidget(
 *   instantsearch.widgets.priceRanges({
 *     container: '#price-ranges',
 *     attributeName: 'price',
 *     labels: {
 *       currency: '$',
 *       separator: 'to',
 *       button: 'Go'
 *     },
 *     templates: {
 *       header: 'Price'
 *     }
 *   })
 * );
 */
export default function priceRanges({
  container,
  attributeName,
  cssClasses: userCssClasses = {},
  templates = defaultTemplates,
  collapsible = false,
  labels: userLabels = {},
  currency: userCurrency = '$',
  autoHideContainer = true,
} = {}) {
  if (!container) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);

  const labels = {
    button: 'Go',
    separator: 'to',
    ...userLabels,
  };

  const cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    header: cx(bem('header'), userCssClasses.header),
    body: cx(bem('body'), userCssClasses.body),
    list: cx(bem('list'), userCssClasses.list),
    link: cx(bem('link'), userCssClasses.link),
    item: cx(bem('item'), userCssClasses.item),
    active: cx(bem('item', 'active'), userCssClasses.active),
    form: cx(bem('form'), userCssClasses.form),
    label: cx(bem('label'), userCssClasses.label),
    input: cx(bem('input'), userCssClasses.input),
    currency: cx(bem('currency'), userCssClasses.currency),
    button: cx(bem('button'), userCssClasses.button),
    separator: cx(bem('separator'), userCssClasses.separator),
    footer: cx(bem('footer'), userCssClasses.footer),
  };

  // before we had opts.currency, you had to pass labels.currency
  const currency =
    userLabels.currency !== undefined ? userLabels.currency : userCurrency;

  const specializedRenderer = renderer({
    containerNode,
    templates,
    renderState: {},
    collapsible,
    cssClasses,
    labels,
    currency,
    autoHideContainer,
  });

  try {
    const makeWidget = connectPriceRanges(specializedRenderer, () =>
      unmountComponentAtNode(containerNode)
    );
    return makeWidget({ attributeName });
  } catch (e) {
    throw new Error(usage);
  }
}
