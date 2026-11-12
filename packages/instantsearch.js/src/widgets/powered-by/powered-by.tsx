/** @jsx h */

import { createDocumentationMessageGenerator } from 'instantsearch-core';
import { createPoweredByComponent } from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';

import { connectPoweredBy } from '../../connectors';
import { getContainerNode } from '../../lib/utils';

import type {
  PoweredByConnectorParams,
  PoweredByRenderState,
  PoweredByWidgetDescription,
} from '../../connectors';
import type { Renderer, WidgetFactory } from 'instantsearch-core';

const withUsage = createDocumentationMessageGenerator({ name: 'powered-by' });

const PoweredBy = createPoweredByComponent({ createElement: h, Fragment });

const renderer =
  ({
    containerNode,
    classNames,
    theme,
  }: {
    containerNode: HTMLElement;
    classNames: PoweredByCSSClasses;
    theme: 'light' | 'dark';
  }): Renderer<PoweredByRenderState, Partial<PoweredByWidgetParams>> =>
  ({ url }, isFirstRendering) => {
    if (isFirstRendering) {
      render(
        <PoweredBy classNames={classNames} url={url} theme={theme} />,
        containerNode
      );

      return;
    }
  };

export type PoweredByCSSClasses = Partial<{
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
}>;

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
  cssClasses?: PoweredByCSSClasses;
};

export type PoweredByWidget = WidgetFactory<
  PoweredByWidgetDescription & { $$widgetType: 'ais.poweredBy' },
  PoweredByConnectorParams,
  PoweredByWidgetParams
>;

const poweredBy: PoweredByWidget = function poweredBy(widgetParams) {
  const {
    container,
    cssClasses: userCssClasses = {},
    theme = 'light',
  } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const classNames: PoweredByCSSClasses = {
    root: userCssClasses.root,
    link: userCssClasses.link,
    logo: userCssClasses.logo,
  };

  const specializedRenderer = renderer({
    containerNode,
    classNames,
    theme,
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
