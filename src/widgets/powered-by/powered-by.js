/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import PoweredBy from '../../components/PoweredBy/PoweredBy';
import connectPoweredBy from '../../connectors/powered-by/connectPoweredBy';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';

const suit = component('PoweredBy');
const withUsage = createDocumentationMessageGenerator({ name: 'powered-by' });

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
 * search.addWidgets([
 *   instantsearch.widgets.poweredBy({
 *     container: '#poweredBy-container',
 *     theme: 'dark',
 *   })
 * ]);
 */
export default function poweredBy({
  container,
  cssClasses: userCssClasses = {},
  theme = 'light',
} = {}) {
  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const cssClasses = {
    root: cx(
      suit(),
      suit({ modifierName: theme === 'dark' ? 'dark' : 'light' }),
      userCssClasses.root
    ),
    link: cx(suit({ descendantName: 'link' }), userCssClasses.link),
    logo: cx(suit({ descendantName: 'logo' }), userCssClasses.logo),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
  });

  const makeWidget = connectPoweredBy(specializedRenderer, () =>
    render(null, containerNode)
  );

  return makeWidget({ theme });
}
