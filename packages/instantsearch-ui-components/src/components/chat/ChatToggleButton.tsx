/** @jsx createElement */
import { cx } from '../../lib/cx';
import { createButtonComponent } from '../Button';

import { SparklesIcon, ChevronUpIcon } from './icons';

import type { ComponentProps, Renderer } from '../../types';

export type ChatToggleButtonClassNames = {
  /**
   * Class names to apply to the root element
   */
  root?: string | string[];
};

export type ChatToggleButtonTranslations = {
  /**
   * Accessible label for the button when the chat is closed
   */
  openLabel: string;
  /**
   * Accessible label for the button when the chat is open
   */
  closeLabel: string;
};

export type ChatToggleButtonOwnProps = {
  /**
   * Whether the chat is open
   */
  open: boolean;
  /**
   * Callback when the button is clicked
   */
  onClick: () => void;
  /**
   * Optional toggle icon component
   */
  toggleIconComponent?: (props: { isOpen: boolean }) => JSX.Element;
  /**
   * Optional class names
   */
  classNames?: Partial<ChatToggleButtonClassNames>;
  /**
   * Translations for the button's accessible label
   */
  translations?: Partial<ChatToggleButtonTranslations>;
};

export type ChatToggleButtonProps = ComponentProps<'button'> &
  ChatToggleButtonOwnProps;

export function createChatToggleButtonComponent({ createElement }: Renderer) {
  const Button = createButtonComponent({ createElement });

  return function ChatToggleButton(userProps: ChatToggleButtonProps) {
    const {
      open,
      onClick,
      toggleIconComponent: ToggleIcon,
      classNames = {},
      className,
      translations: userTranslations,
      ...props
    } = userProps;
    const translations: ChatToggleButtonTranslations = {
      openLabel: 'Open chat',
      closeLabel: 'Close chat',
      ...userTranslations,
    };
    const defaultIcon = open ? (
      <ChevronUpIcon createElement={createElement} />
    ) : (
      <SparklesIcon createElement={createElement} />
    );

    return (
      <Button
        variant="primary"
        size="md"
        iconOnly
        className={cx(
          'ais-ChatToggleButton',
          open && 'ais-ChatToggleButton--open',
          classNames.root,
          className
        )}
        onClick={onClick}
        aria-label={open ? translations.closeLabel : translations.openLabel}
        {...props}
      >
        {ToggleIcon ? <ToggleIcon isOpen={open} /> : defaultIcon}
      </Button>
    );
  };
}
