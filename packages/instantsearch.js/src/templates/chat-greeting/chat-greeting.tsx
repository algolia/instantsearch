/** @jsx h */

import { createChatGreetingComponent } from 'instantsearch-ui-components';
import { h } from 'preact';

import type { ChatGreetingProps } from 'instantsearch-ui-components';

const ChatGreetingComponent = createChatGreetingComponent({
  createElement: h,
});

export function chatGreeting(
  options?: Pick<ChatGreetingProps, 'banner' | 'translations' | 'classNames'>
) {
  return function ChatGreetingTemplate(props: ChatGreetingProps) {
    return <ChatGreetingComponent {...props} {...options} />;
  };
}
