/** @jsx h */

import { createChatToggleButtonComponent } from 'instantsearch-ui-components';
import { createElement, Fragment, render, h } from 'preact';

import {
  createDocumentationMessageGenerator,
  getContainerNode,
} from '../../lib/utils';

import type { Renderer, WidgetFactory } from '../../types';
import type { ChatToggleButtonProps } from 'instantsearch-ui-components';

const withUsage = createDocumentationMessageGenerator({
  name: 'chat-toggle-button',
});

const ChatToggleButton = createChatToggleButtonComponent({
  createElement,
  Fragment,
});

type CreateRendererProps = {
  containerNode: HTMLElement;
  cssClasses: Record<string, string>;
  renderState: ChatToggleButtonProps;
};

function createRenderer({
  renderState,
  cssClasses,
  containerNode,
}: CreateRendererProps): Renderer<
  ChatToggleButtonProps,
  Partial<ChatToggleButtonProps>
> {
  return function renderer() {
    render(
      <ChatToggleButton {...renderState} classNames={cssClasses} />,
      containerNode
    );
  };
}

export type ChatToggleButtonWidget = WidgetFactory<
  {
    $$widgetType: 'ais.trendingItems';
    $$type: 'ais.chatToggleButton';
  },
  ChatToggleButtonProps,
  ChatToggleButtonProps
>;

export default (function chatToggleButton(
  widgetParams: ChatToggleButtonProps & {
    container: string | HTMLElement;
    cssClasses?: Record<string, string>;
  }
) {
  const { container, cssClasses = {} } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const specializedRenderer = createRenderer({
    containerNode,
    cssClasses,
    renderState: { open: false, onClick: () => {} },
  });

  return {
    $$widgetType: 'ais.chatToggleButton',
  };
} satisfies ChatToggleButtonWidget);
