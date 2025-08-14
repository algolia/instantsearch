/** @jsx h */

import { createChatHeaderComponent } from 'instantsearch-ui-components';
import { Fragment, h } from 'preact';

const ChatHeaderUiComponent = createChatHeaderComponent({
  createElement: h,
  Fragment,
});

export type ChatHeaderProps = {
  cssClasses: Record<string, string>;
};

const ChatHeader = ({ cssClasses }: ChatHeaderProps) => (
  <ChatHeaderUiComponent classNames={cssClasses} onClose={() => {}} />
);

export default ChatHeader;
