/** @jsx h */

import { createChatMessageLoaderComponent } from 'instantsearch-ui-components';
import { h } from 'preact';

import type { ChatMessageLoaderProps } from 'instantsearch-ui-components';

const ChatMessageLoader = createChatMessageLoaderComponent({
  createElement: h,
});

export function chatMessageLoader() {
  return function ChatMessageLoaderTemplate(props: ChatMessageLoaderProps) {
    return <ChatMessageLoader {...props} />;
  };
}
