/** @jsx createElement */
import { cx } from '../../lib';

import type { Renderer } from '../../types';
import type { ChatLayoutOwnProps } from './types';

export function createChatInlineLayoutComponent({ createElement }: Renderer) {
  return function ChatInlineLayout(userProps: ChatLayoutOwnProps) {
    const {
      headerComponent,
      messagesComponent,
      promptComponent,
      classNames = {},
      className,
      open: _open,
      maximized: _maximized,
      toggleButtonComponent: _toggleButtonElement,
      // Chat state props (destructured to avoid spreading on div)
      messages: _messages,
      status: _status,
      isClearing: _isClearing,
      onNewConversation: _onNewConversation,
      onClearTransitionEnd: _onClearTransitionEnd,
      suggestions: _suggestions,
      tools: _tools,
      sendMessage: _sendMessage,
      regenerate: _regenerate,
      stop: _stop,
      error: _error,
      ...rest
    } = userProps;

    return (
      <div
        {...rest}
        className={cx(
          'ais-Chat',
          'ais-ChatInlineLayout',
          classNames.root,
          className
        )}
      >
        <div className={cx('ais-Chat-container', classNames.container)}>
          {headerComponent}
          {messagesComponent}
          {promptComponent}
        </div>
      </div>
    );
  };
}
