/** @jsx h */

import { createChatInlineLayoutComponent } from 'instantsearch-ui-components';
import { Fragment, h } from 'preact';

import type { ChatLayoutTemplateData } from '../../widgets/chat/chat';

const ChatInlineLayout = createChatInlineLayoutComponent({
  createElement: h,
  Fragment,
});

export function chatInlineLayout() {
  return function ChatInlineLayoutTemplate(props: ChatLayoutTemplateData) {
    const { templates, ...rest } = props;
    return (
      <ChatInlineLayout
        {...rest}
        headerComponent={templates.header()}
        messagesComponent={templates.messages()}
        promptComponent={templates.prompt()}
        toggleButtonComponent={templates.toggleButton()}
      />
    );
  };
}
