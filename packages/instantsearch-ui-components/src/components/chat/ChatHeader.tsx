/** @jsx createElement */
import { cx } from '../../lib';

import type { Renderer, ComponentProps } from '../../types';

export type ChatHeaderClassNames = {
  root?: string | string[];
  title?: string | string[];
  close?: string | string[];
};

export type ChatHeaderProps = Omit<ComponentProps<'div'>, 'title'> & {
  /**
   * The title to display in the header
   */
  title?: string;
  /**
   * Callback when the close button is clicked
   */
  onClose: () => void;
  /**
   * Accessible label for the close button
   */
  closeLabel?: string;
  /**
   * Optional class names for elements
   */
  classNames?: Partial<ChatHeaderClassNames>;
};

export function createChatHeaderComponent({ createElement }: Renderer) {
  return function ChatHeader({
    title = 'Chat',
    onClose,
    closeLabel = 'Close chat',
    classNames = {},
    ...props
  }: ChatHeaderProps) {
    return (
      <div
        className={cx('ais-ChatHeader', classNames.root, props.className)}
        {...props}
      >
        <span className={cx('ais-ChatHeader-title', classNames.title)}>
          {title}
        </span>
        <button
          className={cx('ais-ChatHeader-close', classNames.close)}
          onClick={onClose}
          aria-label={closeLabel}
          type="button"
        >
          ×
        </button>
      </div>
    );
  };
}
