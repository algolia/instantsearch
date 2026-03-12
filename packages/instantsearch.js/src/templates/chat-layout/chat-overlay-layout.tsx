/** @jsx h */

import { createChatOverlayLayoutComponent } from 'instantsearch-ui-components';
import { Fragment, h } from 'preact';

import type { ChatLayoutOwnProps } from 'instantsearch-ui-components';

const ChatOverlayLayout = createChatOverlayLayoutComponent({
  createElement: h,
  Fragment,
});

export function chatOverlayLayout() {
  return function ChatOverlayLayoutTemplate(props: ChatLayoutOwnProps) {
    return <ChatOverlayLayout {...props} />;
  };
}
