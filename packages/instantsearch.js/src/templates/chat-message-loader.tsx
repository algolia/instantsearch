/** @jsx h */

import { createChatMessageLoaderComponent } from 'instantsearch-ui-components';
import { h } from 'preact';

import type {
  ChatComponentPropsWithContext,
  ChatMessageLoaderProps,
} from 'instantsearch-ui-components';

const ChatMessageLoader = createChatMessageLoaderComponent({
  createElement: h,
});

export function chatMessageLoader(
  props: ChatComponentPropsWithContext<ChatMessageLoaderProps>
) {
  return <ChatMessageLoader {...props} />;
}
