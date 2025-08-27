import type { Renderer, ComponentProps } from '../types';

export type ChatToggleButtonProps = {
  open: boolean;
  onClick: () => void;
  openLabel?: string;
  closeLabel?: string;
  className?: string;
} & ComponentProps<'button'>;

export function createChatToggleButtonComponent({ createElement }: Renderer) {
  return function ChatToggleButton({
    open,
    onClick,
    openLabel = 'Open chat',
    closeLabel = 'Close chat',
    className = '',
    ...props
  }: ChatToggleButtonProps) {
    return createElement(
      'button',
      {
        className: [
          'ais-Chat-toggle',
          open && 'ais-Chat-toggle--open',
          className,
        ]
          .filter(Boolean)
          .join(' '),
        onClick,
        type: 'button',
        ...props,
      },
      open ? closeLabel : openLabel
    );
  };
}
