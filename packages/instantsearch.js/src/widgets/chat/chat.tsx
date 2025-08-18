/** @jsx h */

import { createChatComponent } from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';

import connectChat from '../../connectors/chat/connectChat';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import type {
  ChatConnectorParams,
  ChatWidgetDescription,
} from '../../connectors/chat/connectChat';
import type { WidgetFactory } from '../../types';
import type {
  ChatHeaderProps,
  ChatMessagesProps,
  ChatPromptProps,
  ChatToggleButtonProps,
  ChatClassNames,
} from 'instantsearch-ui-components';

const withUsage = createDocumentationMessageGenerator({
  name: 'chat',
});

const Chat = createChatComponent({
  createElement: h,
  Fragment,
});

type CreateRendererProps = {
  containerNode: HTMLElement;
  cssClasses: ChatClassNames;
  renderState: {
    open?: boolean;
    headerProps?: ChatHeaderProps;
    toggleButtonProps?: ChatToggleButtonProps;
    messagesProps?: ChatMessagesProps;
    promptProps?: ChatPromptProps;
  };
};

function createRenderer({
  renderState,
  cssClasses,
  containerNode,
}: CreateRendererProps) {
  return function renderer() {
    const headerProps: ChatHeaderProps = {
      onClose: () => {
        renderState.open = false;
      },
    };
    const toggleButtonProps: ChatToggleButtonProps = {
      open: renderState.open || false,
      onClick: () => {
        renderState.open = !renderState.open;
      },
    };
    const messagesProps: ChatMessagesProps = {
      messages: renderState.messagesProps?.messages || [],
    };
    const promptProps: ChatPromptProps = {
      ...(renderState.promptProps || {}),
    };

    render(
      <Chat
        open={renderState.open || false}
        headerProps={headerProps}
        toggleButtonProps={toggleButtonProps}
        messagesProps={messagesProps}
        promptProps={promptProps}
        classNames={{ container: cssClasses.container }}
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
  ChatConnectorParams,
  ChatWidgetParams
>;

const chat: ChatWidget = function chat(widgetParams) {
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
    $$widgetType: 'ais.chat',
  };
};

export default chat;
