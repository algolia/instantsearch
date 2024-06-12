/** @jsx h */

import { cx } from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';

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
import { configure } from '../../../es/widgets';
import { ConfigureWidgetParams } from '../configure/configure';
import hits, { HitsWidgetParams } from '../hits/hits';

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

const components = {
  'ais.configure': (widgetParams: ConfigureWidgetParams) =>
    configure(widgetParams),
  'ais.hits': (widgetParams: HitsWidgetParams) => hits(widgetParams),
  'heading-1': ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
  'heading-2': ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
  'heading-3': ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
  'heading-4': ({ children, ...props }: any) => <h4 {...props}>{children}</h4>,
  'heading-5': ({ children, ...props }: any) => <h5 {...props}>{children}</h5>,
  'heading-6': ({ children, ...props }: any) => <h6 {...props}>{children}</h6>,
  paragraph: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  image: (props: any) => <img {...props} />,
  link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
  text: ({ children }: any) => <Fragment>{children}</Fragment>,
};

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
  ({ blocks }, isFirstRendering) => {
    if (isFirstRendering) {
      return;
    }

    render(<div>Layout {JSON.stringify(blocks)}</div>, containerNode);
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
