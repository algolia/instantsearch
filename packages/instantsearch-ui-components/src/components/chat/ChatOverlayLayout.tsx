/** @jsx createElement */
import { cx } from '../../lib';

import type { Renderer } from '../../types';
import type { ChatLayoutOwnProps } from './types';

export function createChatOverlayLayoutComponent({ createElement }: Renderer) {
  return function ChatOverlayLayout(userProps: ChatLayoutOwnProps) {
    const {
      open,
      maximized,
      headerComponent,
      messagesComponent,
      promptComponent,
      toggleButtonComponent,
      classNames = {},
      // Chat state props (destructured to avoid spreading on div)
      messages: _messages,
      status: _status,
      isClearing: _isClearing,
      clearMessages: _clearMessages,
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
          {headerComponent}
          {messagesComponent}
          {promptComponent}
        </div>

        <div className="ais-Chat-toggleButtonWrapper">
          {toggleButtonComponent}
        </div>
      </div>
    );
  };
}
