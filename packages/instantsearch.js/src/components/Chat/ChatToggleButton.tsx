/** @jsx h */

import { createChatToggleButtonComponent } from 'instantsearch-ui-components';
import { Fragment, h } from 'preact';

const ChatToggleButtonUiComponent = createChatToggleButtonComponent({
  createElement: h,
  Fragment,
});

export type ChatToggleButtonProps = {
  cssClasses: Record<string, string>;
};

const ChatToggleButton = ({ cssClasses }: ChatToggleButtonProps) => (
  <ChatToggleButtonUiComponent
    classNames={cssClasses}
    onClick={() => {}}
    open={false}
  />
);

export default ChatToggleButton;
