/** @jsx createElement */
import { cx } from '../../lib/cx';

import type { ComponentProps, Renderer } from '../../types';

export type ChatToggleButtonClassNames = {
  root?: string | string[];
};

export type ChatToggleButtonProps = Omit<ComponentProps<'button'>, 'open'> & {
  open: boolean;
  onClick: () => void;
  openLabel?: string;
  closeLabel?: string;
  classNames?: Partial<ChatToggleButtonClassNames>;
};

export function createChatToggleButtonComponent({ createElement }: Renderer) {
  return function ChatToggleButton({
    open,
    onClick,
    openLabel = 'Open chat',
    closeLabel = 'Close chat',
    classNames = {},
    ...props
  }: ChatToggleButtonProps) {
    return (
      <button
        className={cx(
          'ais-ChatToggleButton',
          open && 'ais-ChatToggleButton--open',
          classNames.root,
          props.className
        )}
        onClick={onClick}
        type="button"
        {...props}
      >
        {open ? closeLabel : openLabel}
      </button>
    );
  };
}
