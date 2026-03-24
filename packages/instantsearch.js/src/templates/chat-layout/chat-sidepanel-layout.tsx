/** @jsx h */

import { createChatSidePanelLayoutComponent } from 'instantsearch-ui-components';
import { Fragment, h } from 'preact';

import type { ChatSidePanelLayoutProps } from 'instantsearch-ui-components';
import type { ChatLayoutTemplateData } from '../../widgets/chat/chat';

const ChatSidePanelLayout = createChatSidePanelLayoutComponent({
  createElement: h,
  Fragment,
});

export function chatSidePanelLayout(
  options?: Pick<ChatSidePanelLayoutProps, 'parentElement'>
) {
  return function ChatSidePanelLayoutTemplate(props: ChatLayoutTemplateData) {
    const { templates, ...rest } = props;
    return (
      <ChatSidePanelLayout
        {...rest}
        parentElement={options?.parentElement}
        headerComponent={templates.header()}
        messagesComponent={templates.messages()}
        promptComponent={templates.prompt()}
        toggleButtonComponent={templates.toggleButton()}
      />
    );
  };
}
