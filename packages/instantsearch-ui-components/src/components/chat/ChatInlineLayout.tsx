/** @jsx createElement */
import { cx } from '../../lib';

import type { Renderer } from '../../types';
import type { ChatLayoutOwnProps } from './types';

export function createChatInlineLayoutComponent({ createElement }: Renderer) {
  return function ChatInlineLayout(userProps: ChatLayoutOwnProps) {
    const {
      headerElement,
      messagesElement,
      promptElement,
      classNames = {},
      open: _open,
      maximized: _maximized,
      toggleButtonElement: _toggleButtonElement,
      // Chat state props (destructured to avoid spreading on div)
      messages: _messages,
      status: _status,
      isClearing: _isClearing,
      clearMessages: _clearMessages,
      onClearTransitionEnd: _onClearTransitionEnd,
      suggestions: _suggestions,
      tools: _tools,
      ...rest
    } = userProps;

    return (
      <div
        {...rest}
        className={cx('ais-Chat', 'ais-ChatInlineLayout', classNames.root)}
      >
        <div
          className={cx(
            'ais-Chat-container',
            'ais-Chat-container--open',
            classNames.container
          )}
        >
          {headerElement}
          {messagesElement}
          {promptElement}
        </div>
      </div>
    );
  };
}
