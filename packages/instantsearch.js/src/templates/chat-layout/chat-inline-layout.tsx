/** @jsx h */

import { createChatInlineLayoutComponent } from 'instantsearch-ui-components';
import { Fragment, h } from 'preact';

import type { ChatLayoutTemplateData } from '../../widgets/chat/chat';

const ChatInlineLayout = createChatInlineLayoutComponent({
  createElement: h,
  Fragment,
});

export function chatInlineLayout() {
  function ChatInlineLayoutTemplate(props: ChatLayoutTemplateData) {
    const { templates, ...rest } = props;
    return (
      <ChatInlineLayout
        {...rest}
        headerComponent={templates.header()}
        messagesComponent={templates.messages()}
        promptComponent={templates.prompt()}
      />
    );
  }
  // Marker used by `chat` to auto-exempt inline layouts from the entry-point
  // validation, since inline chats are always visible (no trigger needed).
  ChatInlineLayoutTemplate.$$inlineLayout = true as const;
  return ChatInlineLayoutTemplate;
}
