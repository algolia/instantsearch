import React, { useEffect, useState } from 'react';
import { useChatTrigger } from 'react-instantsearch-core';

import type { ChatHandle } from './Chat';

export type ChatTriggerProps = {
  /**
   * Reference to the Chat component.
   * Get this by using React.useRef() and passing it to the Chat component's `ref` prop.
   */
  chatRef: React.RefObject<ChatHandle>;

  /**
   * CSS class to add to the button.
   */
  className?: string;

  /**
   * Aria label for accessibility.
   * @default "Toggle chat"
   */
  ariaLabel?: string;

  /**
   * Custom button content/children.
   * If not provided, will show "Open" or "Close" text.
   */
  children?: React.ReactNode;

  /**
   * Callback when the trigger is clicked.
   */
  onClick?: () => void;
};

export function ChatTrigger({
  chatRef,
  className = 'ais-ChatTrigger',
  ariaLabel = 'Toggle chat',
  children,
  onClick,
}: ChatTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  useChatTrigger({}, { $$widgetType: 'ais.chatTrigger' });

  useEffect(() => {
    if (chatRef.current) {
      setIsOpen(chatRef.current.getOpen?.() ?? false);
    }
  }, [chatRef]);

  const handleClick = () => {
    if (chatRef.current) {
      const currentOpen = chatRef.current.getOpen?.() ?? isOpen;
      const nextOpen = !currentOpen;

      chatRef.current.setOpen(nextOpen);
      setIsOpen(nextOpen);
    }
    onClick?.();
  };

  return (
    <button
      className={className}
      onClick={handleClick}
      aria-label={ariaLabel}
      aria-pressed={isOpen}
      type="button"
    >
      {children ? children : isOpen ? 'Close' : 'Open'}
    </button>
  );
}
