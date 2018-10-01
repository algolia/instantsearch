import React, { render, unmountComponentAtNode } from 'preact-compat';
import cx from 'classnames';

import PoweredBy from '../../components/PoweredBy/PoweredBy';
import connectPoweredBy from '../../connectors/powered-by/connectPoweredBy.js';
import { getContainerNode } from '../../lib/utils.js';
import { component } from '../../lib/suit';

const suit = component('PoweredBy');

const renderer = ({ containerNode, cssClasses }) => (
  { widgetParams },
  isFirstRendering
) => {
  if (isFirstRendering) {
    const { url, theme } = widgetParams;

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
 * @typedef {Object} PoweredByWidgetOptions
 * @property {string|HTMLElement} container Place where to insert the widget in your webpage.
 * @property {string} [theme] The theme of the logo ("light" or "dark").
 * @property {PoweredByWidgetCssClasses} [cssClasses] CSS classes to add.
 */

/**
 * The `poweredBy` widget is used to display useful insights about the current results.
 * @type {WidgetFactory}
 * @devNovel PoweredBy
 * @category metadata
 * @param {PoweredByWidgetOptions} $0 PoweredBy widget options. Some keys are mandatory: `container`,
 * @return {Widget} A new poweredBy widget instance
 * @example
 * search.addWidget(
 *   instantsearch.widgets.poweredBy({
 *     container: '#poweredBy-container'
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
  const url =
    'https://www.algolia.com/?' +
    'utm_source=instantsearch.js&' +
    'utm_medium=website&' +
    `utm_content=${location.hostname}&` +
    'utm_campaign=poweredby';

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
    return makeWidget({ url, theme });
  } catch (error) {
    throw new Error(usage);
  }
}
