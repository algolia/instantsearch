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
