/** @jsx h */

import { createChatPromptComponent } from 'instantsearch-ui-components';
import { Fragment, h } from 'preact';

const ChatPromptUiComponent = createChatPromptComponent({
  createElement: h,
  Fragment,
});

export type ChatPromptProps = {
  cssClasses: Record<string, string>;
};

const ChatPrompt = ({ cssClasses }: ChatPromptProps) => (
  <ChatPromptUiComponent classNames={cssClasses} onClick={() => {}} />
);

export default ChatPrompt;
