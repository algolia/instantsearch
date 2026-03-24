/** @jsx createElement */
import { cx } from '../../lib';

import type { Renderer } from '../../types';
import type { ChatLayoutOwnProps } from './types';

export type ChatSidePanelLayoutProps = ChatLayoutOwnProps & {
  parentElement?: HTMLElement;
};

export function createChatSidePanelLayoutComponent({
  createElement,
}: Renderer) {
  return function ChatSidePanelLayout(userProps: ChatSidePanelLayoutProps) {
    const {
      open,
      maximized,
      headerComponent,
      messagesComponent,
      promptComponent,
      toggleButtonComponent,
      classNames = {},
      parentElement,
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

    const element =
      parentElement ||
      (typeof document !== 'undefined' ? document.body : null);
    if (element) {
      if (open) {
        element.classList.add('ais-ChatSidePanelLayout--body-open');
      } else {
        element.classList.remove('ais-ChatSidePanelLayout--body-open');
      }
    }

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
