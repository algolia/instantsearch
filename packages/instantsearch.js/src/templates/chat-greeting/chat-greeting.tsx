/** @jsx h */

import { createChatGreetingComponent } from 'instantsearch-ui-components';
import { h } from 'preact';

import type { ChatEmptyProps } from 'instantsearch-ui-components';

const ChatGreetingComponent = createChatGreetingComponent({
  createElement: h,
});

export function chatEmpty(
  options?: Pick<ChatEmptyProps, 'banner'>
) {
  return function ChatEmptyTemplate(props: ChatEmptyProps) {
    return <ChatGreetingComponent {...props} banner={options?.banner} />;
  };
}
