/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import PoweredBy from '../../components/PoweredBy/PoweredBy';
import connectPoweredBy, {
  PoweredByConnectorParams,
  PoweredByRenderState,
  PoweredByWidgetDescription,
} from '../../connectors/powered-by/connectPoweredBy';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import { Renderer, WidgetFactory } from '../../types';

const suit = component('PoweredBy');
const withUsage = createDocumentationMessageGenerator({ name: 'powered-by' });

const renderer = ({
  containerNode,
  cssClasses,
}): Renderer<PoweredByRenderState, Partial<PoweredByWidgetParams>> => (
  { url, widgetParams },
  isFirstRendering
) => {
  if (isFirstRendering) {
    const { theme = 'light' } = widgetParams;

    render(
      <PoweredBy cssClasses={cssClasses} url={url} theme={theme} />,
      containerNode
    );

    return;
  }
};

export type PoweredByCSSClasses = {
  /**
   * CSS class to add to the wrapping element.
   */
  root: string | string[];

  /**
   * CSS class to add to the link.
   */
  link: string | string[];

  /**
   * CSS class to add to the SVG logo.
   */
  logo: string | string[];
};

export type PoweredByWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  /**
   * The theme of the logo.
   * @default 'light'
   */
  theme?: 'light' | 'dark';

  /**
   * CSS classes to add.
   */
  cssClasses?: Partial<PoweredByCSSClasses>;
};

export type PoweredByWidget = WidgetFactory<
  PoweredByWidgetDescription & { $$widgetType: 'ais.poweredBy' },
  PoweredByConnectorParams,
  PoweredByWidgetParams
>;

const poweredBy: PoweredByWidget = function poweredBy(widgetParams) {
  const { container, cssClasses: userCssClasses = {}, theme = 'light' } =
    widgetParams || {};

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

  return {
    ...makeWidget({ theme }),
    $$widgetType: 'ais.poweredBy',
  };
};

export default poweredBy;
