/** @jsx createElement */
import { cx } from '../../lib';

import type { Renderer } from '../../types';
import type { ChatLayoutOwnProps } from './types';

export function createChatOverlayLayoutComponent({ createElement }: Renderer) {
  return function ChatOverlayLayout(userProps: ChatLayoutOwnProps) {
    const {
      open,
      maximized,
      headerElement,
      messagesElement,
      promptElement,
      toggleButtonElement,
      classNames = {},
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
        className={cx(
          'ais-Chat',
          'ais-ChatOverlayLayout',
          maximized && 'ais-ChatOverlayLayout--maximized',
          classNames.root
        )}
      >
        <div
          className={cx(
            'ais-Chat-container',
            open && 'ais-Chat-container--open',
            maximized && 'ais-Chat-container--maximized',
            classNames.container
          )}
        >
          {headerElement}
          {messagesElement}
          {promptElement}
        </div>

        <div className="ais-Chat-toggleButtonWrapper">
          {toggleButtonElement}
        </div>
      </div>
    );
  };
}
