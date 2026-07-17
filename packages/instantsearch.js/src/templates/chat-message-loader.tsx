/** @jsx h */

import { createChatMessageLoaderComponent } from 'instantsearch-ui-components';
import { h } from 'preact';

import type {
  ChatComponentPropsWithMetadata,
  ChatMessageLoaderProps,
} from 'instantsearch-ui-components';

const ChatMessageLoader = createChatMessageLoaderComponent({
  createElement: h,
});

export function chatMessageLoader(
  props: ChatComponentPropsWithMetadata<ChatMessageLoaderProps>
) {
  return <ChatMessageLoader {...props} />;
}
