/** @jsx createElement */
import { cx } from '../../lib';

import type { Renderer } from '../../types';
import type { ChatLayoutOwnProps } from './ChatOverlayLayout';

export function createChatInlineLayoutComponent({ createElement }: Renderer) {
  return function ChatInlineLayout({
    headerElement,
    messagesElement,
    promptElement,
    classNames = {},
  }: ChatLayoutOwnProps) {
    return (
      <div className={cx('ais-Chat', 'ais-ChatInlineLayout', classNames.root)}>
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
