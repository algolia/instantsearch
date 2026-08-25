/** @jsx h */

import { createChatMessageLoaderComponent } from 'instantsearch-ui-components';
import { h } from 'preact';

import type { ChatMessageLoaderPropsWithContext } from 'instantsearch-ui-components';

const ChatMessageLoader = createChatMessageLoaderComponent({
  createElement: h,
});

export function chatMessageLoader(props: ChatMessageLoaderPropsWithContext) {
  return <ChatMessageLoader {...props} />;
}
