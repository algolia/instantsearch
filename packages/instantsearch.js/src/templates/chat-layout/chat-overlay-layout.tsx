/** @jsx h */

import { createChatOverlayLayoutComponent } from 'instantsearch-ui-components';
import { Fragment, h } from 'preact';

import type { ChatLayoutTemplateData } from '../../widgets/chat/chat';

const ChatOverlayLayout = createChatOverlayLayoutComponent({
  createElement: h,
  Fragment,
});

export function chatOverlayLayout() {
  return function ChatOverlayLayoutTemplate(props: ChatLayoutTemplateData) {
    const { templates, ...rest } = props;
    return (
      <ChatOverlayLayout
        {...rest}
        headerComponent={templates.header()}
        messagesComponent={templates.messages()}
        promptComponent={templates.prompt()}
        toggleButtonComponent={templates.toggleButton()}
      />
    );
  };
}
