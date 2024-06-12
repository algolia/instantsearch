import { render } from 'preact';

import connectLayout from '../../connectors/layout/connectLayout';
import {
  createDocumentationMessageGenerator,
  getContainerNode,
} from '../../lib/utils';

import type {
  LayoutConnectorParams,
  LayoutRenderState,
  LayoutWidgetDescription,
} from '../../connectors/layout/connectLayout';
import type { Renderer, WidgetFactory } from '../../types';

const withUsage = createDocumentationMessageGenerator({ name: 'layout' });

export type LayoutWidgetParams = {
  container: string;
};

type LayoutWidget = WidgetFactory<
  LayoutWidgetDescription & { $$widgetType: 'ais.layout' },
  LayoutConnectorParams,
  LayoutWidgetParams
>;

const renderer = ({
  containerNode,
}: {
  containerNode: HTMLElement;
}): Renderer<LayoutRenderState, Partial<LayoutWidgetParams>> => {
  return (_renderState, _isFirstRendering) => {
    render('Hello world', containerNode);
  };
};

const layout: LayoutWidget = function layout(widgetParams) {
  const { container, id } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const specializedRenderer = renderer({
    containerNode,
    // cssClasses,
    // renderState: {},
    // templates,
  });

  const makeWidget = connectLayout(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget({
      id,
    }),
    $$widgetType: 'ais.layout',
  };
};

export default layout;
