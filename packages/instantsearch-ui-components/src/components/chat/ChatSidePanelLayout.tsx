/** @jsx createElement */
import { cx } from '../../lib';

import type { Renderer } from '../../types';
import type { ChatLayoutOwnProps } from './types';

export type ChatSidePanelLayoutProps = ChatLayoutOwnProps & {
  parentElement?: string;
};

export function createChatSidePanelLayoutComponent({
  createElement,
}: Renderer) {
  const originalMargins = new WeakMap<HTMLElement, string>();

  return function ChatSidePanelLayout(userProps: ChatSidePanelLayoutProps) {
    const {
      open,
      maximized,
      headerComponent,
      messagesComponent,
      promptComponent,
      toggleButtonComponent,
      classNames = {},
      className,
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
      typeof document !== 'undefined'
        ? parentElement
          ? document.querySelector<HTMLElement>(parentElement)
          : document.body
        : null;
    if (element) {
      if (open && !originalMargins.has(element)) {
        originalMargins.set(element, element.style.marginRight);
        const chatWidth =
          getComputedStyle(document.documentElement)
            .getPropertyValue('--ais-chat-width')
            .trim() || '22.5rem';
        const original = originalMargins.get(element)!;
        element.style.marginRight = original
          ? `calc(${original} + ${chatWidth})`
          : chatWidth;
      } else if (!open && originalMargins.has(element)) {
        element.style.marginRight = originalMargins.get(element) || '';
        originalMargins.delete(element);
      }
    }

    return (
      <div
        {...rest}
        className={cx(
          'ais-Chat',
          'ais-ChatSidePanelLayout',
          maximized && 'ais-ChatSidePanelLayout--maximized',
          classNames.root,
          className
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
