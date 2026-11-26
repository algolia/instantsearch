/** @jsx createElement */
import { cx } from '../../lib';

import type { ChatLayoutOwnProps } from './types';
import type { Renderer } from '../../types';

export type ChatSidePanelLayoutProps = ChatLayoutOwnProps & {
  parentElement?: string;
};

export function createChatSidePanelLayoutComponent({
  createElement,
}: Renderer) {
  const originalMargins = new WeakMap<HTMLElement, string>();

  /**
   * Puts back the margin this component shifted on a page element, if it
   * shifted one. Called on the render that closes the panel, and by hosts that
   * tear the panel down while it is still open (that render never comes).
   */
  function restoreMargin(element: HTMLElement | null | undefined) {
    if (!element || !originalMargins.has(element)) {
      return;
    }

    const saved = originalMargins.get(element);
    if (saved) {
      element.style.marginRight = saved;
    } else {
      element.style.removeProperty('margin-right');
    }
    originalMargins.delete(element);
  }

  function ChatSidePanelLayout(userProps: ChatSidePanelLayoutProps) {
    const {
      open,
      maximized,
      headerComponent,
      messagesComponent,
      promptComponent,
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
    // React versions before 19 preserve unknown boolean attributes as numbers.
    const inert = open ? undefined : (1 as unknown as boolean);

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
        const original = originalMargins.get(element);
        element.style.marginRight = original
          ? `calc(${original} + ${chatWidth})`
          : chatWidth;
      } else if (!open) {
        restoreMargin(element);
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
          inert={inert}
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
      </div>
    );
  }

  // The render above hands the margin back when it runs closed. A host that
  // removes the panel while it is still open never runs it, so the flavors'
  // teardown calls this instead.
  return Object.assign(ChatSidePanelLayout, { restoreMargin });
}
