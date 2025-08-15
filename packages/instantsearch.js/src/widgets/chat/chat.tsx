/** @jsx h */

import { createChatComponent } from 'instantsearch-ui-components/src/components/chat/Chat';
import { Fragment, h, render } from 'preact';

import connectChat from '../../connectors/chat/connectChat';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import type { ChatWidgetDescription } from '../../connectors/chat/connectChat';
import type { WidgetFactory } from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'chat',
});

const Chat = createChatComponent({
  createElement: h,
  Fragment,
});

type CreateRendererProps = {
  containerNode: HTMLElement;
  cssClasses: Record<string, string>;
  renderState: Record<string, string>;
};

function createRenderer({
  renderState,
  cssClasses,
  containerNode,
}: CreateRendererProps) {
  return function renderer() {
    render(
      <Chat
        messages={[]}
        onClickHeader={() => {}}
        onClickToggleButton={() => {}}
        status="ready"
      />,
      containerNode
    );
  };
}

type ChatWidgetParams = {
  /**
   * CSS selector or `HTMLElement` to insert the widget into.
   */
  container: string | HTMLElement;

  /**
   * CSS classes to add to the widget elements.
   */
  cssClasses?: Record<string, string>;
};

export type ChatWidget = WidgetFactory<
  ChatWidgetDescription & {
    $$widgetType: 'ais.chat';
  },
  Record<string, string>,
  ChatWidgetParams
>;

export default (function chat(
  widgetParams: ChatWidgetParams & Record<string, string>
) {
  const { container, cssClasses = {} } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const specializedRenderer = createRenderer({
    containerNode,
    cssClasses,
    renderState: {},
  });

  const makeWidget = connectChat(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget(widgetParams),
    $$widgetType: 'ais.trendingItems',
  };
});
