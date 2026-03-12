/** @jsx h */

import { createChatInlineLayoutComponent } from 'instantsearch-ui-components';
import { Fragment, h } from 'preact';

import type { ChatLayoutOwnProps } from 'instantsearch-ui-components';

const ChatInlineLayout = createChatInlineLayoutComponent({
  createElement: h,
  Fragment,
});

export function chatInlineLayout() {
  return function ChatInlineLayoutTemplate(props: ChatLayoutOwnProps) {
    return <ChatInlineLayout {...props} />;
  };
}
