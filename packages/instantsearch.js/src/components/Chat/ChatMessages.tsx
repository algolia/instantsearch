/** @jsx h */

import { createChatMessagesComponent } from 'instantsearch-ui-components';
import { Fragment, h } from 'preact';

const ChatMessagesUiComponent = createChatMessagesComponent({
  createElement: h,
  Fragment,
});

export type ChatMessagesProps = {
  cssClasses: Record<string, string>;
};

const ChatMessages = ({ cssClasses }: ChatMessagesProps) => (
  <ChatMessagesUiComponent classNames={cssClasses} messages={[]} />
);

export default ChatMessages;
