import React, { render, unmountComponentAtNode } from 'preact-compat';
import cx from 'classnames';
import PoweredBy from '../../components/PoweredBy/PoweredBy';
import connectPoweredBy from '../../connectors/powered-by/connectPoweredBy.js';
import { getContainerNode } from '../../lib/utils.js';
import { component } from '../../lib/suit';

const suit = component('PoweredBy');

const renderer = ({ containerNode, cssClasses }) => (
  { url, widgetParams },
  isFirstRendering
) => {
  if (isFirstRendering) {
    const { theme } = widgetParams;

    render(
      <PoweredBy cssClasses={cssClasses} url={url} theme={theme} />,
      containerNode
    );

    return;
  }
};

const usage = `Usage:
poweredBy({
  container,
  [ theme = 'light' ],
})`;

/**
 * @typedef {Object} PoweredByWidgetCssClasses
 * @property  {string|string[]} [root] CSS classes added to the root element of the widget.
 * @property  {string|string[]} [link] CSS class to add to the link.
 * @property  {string|string[]} [logo] CSS class to add to the SVG logo.
 */

/**
 * @typedef {Object} PoweredByWidgetOptions
 * @property {string|HTMLElement} container Place where to insert the widget in your webpage.
 * @property {string} [theme] The theme of the logo ("light" or "dark").
 * @property {PoweredByWidgetCssClasses} [cssClasses] CSS classes to add.
 */

/**
 * The `poweredBy` widget is used to display the logo to redirect to Algolia.
 * @type {WidgetFactory}
 * @devNovel PoweredBy
 * @category metadata
 * @param {PoweredByWidgetOptions} $0 PoweredBy widget options. Some keys are mandatory: `container`,
 * @return {Widget} A new poweredBy widget instance
 * @example
 * search.addWidget(
 *   instantsearch.widgets.poweredBy({
 *     container: '#poweredBy-container',
 *     theme: 'dark',
 *   })
 * );
 */
export default function poweredBy({
  container,
  cssClasses: userCssClasses = {},
  theme = 'light',
} = {}) {
  if (!container) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);

  const cssClasses = {
    root: cx(
      suit(),
      suit({ modifierName: theme === 'dark' ? 'dark' : 'light' }),
      userCssClasses.root
    ),
    link: cx(suit({ descendant: 'link' }), userCssClasses.link),
    logo: cx(suit({ descendant: 'logo' }), userCssClasses.logo),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
  });

  try {
    const makeWidget = connectPoweredBy(specializedRenderer, () =>
      unmountComponentAtNode(containerNode)
    );

    return makeWidget({ theme });
  } catch (error) {
    throw new Error(usage);
  }
}
