/** @jsx h */

import { cx } from 'instantsearch-ui-components';
import { h, render } from 'preact';

import connectLayout from '../../connectors/layout/connectLayout';
import { component } from '../../lib/suit';
import {
  createDocumentationMessageGenerator,
  getContainerNode,
} from '../../lib/utils';

import type {
  LayoutConnectorParams,
  LayoutRenderState,
  LayoutWidgetDescription,
} from '../../connectors/layout/connectLayout';
import type { ComponentCSSClasses, WidgetFactory, Renderer } from '../../types';

export type LayoutCSSClasses = Partial<{
  /**
   * CSS class to add to the wrapping element.
   */
  root: string | string[];
}>;

export type LayoutWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  /**
   * CSS classes to add.
   */
  cssClasses?: LayoutCSSClasses;
};

type LayoutWidget = WidgetFactory<
  LayoutWidgetDescription & { $$widgetType: 'ais.layout' },
  LayoutConnectorParams,
  LayoutWidgetParams
>;

const suit = component('Layout');
const withUsage = createDocumentationMessageGenerator({ name: 'layout' });

type LayoutComponentCSSClasses = ComponentCSSClasses<LayoutCSSClasses>;

type RendererParams = {
  containerNode: HTMLElement;
  cssClasses: LayoutComponentCSSClasses;
};

const renderer =
  ({
    containerNode,
  }: RendererParams): Renderer<
    LayoutRenderState,
    Partial<LayoutWidgetParams>
  > =>
  (_, isFirstRendering) => {
    if (isFirstRendering) {
      render(<div>Layout</div>, containerNode);

      return;
    }
  };

const layout: LayoutWidget = function layout(widgetParams) {
  const {
    container,
    cssClasses: userCssClasses = {},
    path,
    id,
  } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
  });

  const makeWidget = connectLayout(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget({
      id,
      path,
    }),
    $$widgetType: 'ais.layout',
  };
};

export default layout;
