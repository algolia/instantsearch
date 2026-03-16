/** @jsx createElement */
import { cx } from '../../lib';

import type { Renderer } from '../../types';
import type { ChatLayoutOwnProps } from './types';

export function createChatSidePanelLayoutComponent({
  createElement,
}: Renderer) {
  return function ChatSidePanelLayout(userProps: ChatLayoutOwnProps) {
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
      ...rest
    } = userProps;

    return (
      <div
        {...rest}
        className={cx(
          'ais-Chat',
          'ais-ChatSidePanelLayout',
          maximized && 'ais-ChatSidePanelLayout--maximized',
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
