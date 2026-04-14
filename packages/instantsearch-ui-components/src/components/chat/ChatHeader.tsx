/** @jsx createElement */
import { cx } from '../../lib';
import { createButtonComponent } from '../Button';

import {
  SparklesIcon,
  MaximizeIcon as MaximizeIconDefault,
  MinimizeIcon as MinimizeIconDefault,
  CloseIcon as CloseIconDefault,
  SquarePenIcon,
} from './icons';

import type { Renderer, ComponentProps } from '../../types';

export type ChatHeaderTranslations = {
  /**
   * The title to display in the header
   */
  title: string;
  /**
   * Accessible label for the minimize button
   */
  minimizeLabel: string;
  /**
   * Accessible label for the maximize button
   */
  maximizeLabel: string;
  /**
   * Accessible label for the close button
   */
  closeLabel: string;
  /**
   * Accessible label for the new-conversation control
   */
  newConversationLabel: string;
};

export type ChatHeaderClassNames = {
  /**
   * Class names to apply to the root element
   */
  root?: string | string[];
  /**
   * Class names to apply to the title element
   */
  title?: string | string[];
  /**
   * Class names to apply to the title icon element
   */
  titleIcon?: string | string[];
  /**
   * Class names to apply to the maximize button element
   */
  maximize?: string | string[];
  /**
   * Class names to apply to the close button element
   */
  close?: string | string[];
  /**
   * Class names for the new-conversation button
   */
  newConversation?: string | string[];
};

export type ChatHeaderOwnProps = {
  /**
   * Whether the chat is maximized
   */
  maximized?: boolean;
  /**
   * Callback when the maximize button is clicked
   */
  onToggleMaximize?: () => void;
  /**
   * Callback when the close button is clicked
   */
  onClose: () => void;
  /**
   * Callback to start a new conversation. Shown as the square-pen icon when `onStartNewConversation` is not set.
   */
  onNewConversation?: () => void;
  /**
   * @deprecated Renamed to `onNewConversation`.
   */
  onClear?: () => void;
  /**
   * Whether the new-conversation action is enabled (when `onNewConversation` is used for the icon).
   */
  canStartNewConversation?: boolean;
  /**
   * @deprecated Renamed to `canStartNewConversation`.
   */
  canClear?: boolean;
  /**
   * Optional close icon component
   */
  closeIconComponent?: () => JSX.Element;
  /**
   * Optional minimize icon component
   */
  minimizeIconComponent?: () => JSX.Element;
  /**
   * Optional maximize icon component
   */
  maximizeIconComponent?: (props: { maximized: boolean }) => JSX.Element;
  /**
   * Optional title icon component (defaults to sparkles)
   */
  titleIconComponent?: () => JSX.Element;
  /**
   * When set, the square-pen icon calls this instead of `onNewConversation`.
   */
  onStartNewConversation?: () => void;
  /**
   * Optional icon for the new-conversation control
   */
  newConversationIconComponent?: () => JSX.Element;
  /**
   * Optional class names for elements
   */
  classNames?: Partial<ChatHeaderClassNames>;
  /**
   * Optional translations
   */
  translations?: Partial<ChatHeaderTranslations>;
};

export type ChatHeaderProps = ComponentProps<'div'> & ChatHeaderOwnProps;

export function createChatHeaderComponent({ createElement }: Renderer) {
  const Button = createButtonComponent({ createElement });

  return function ChatHeader(userProps: ChatHeaderProps) {
    const {
      maximized = false,
      onToggleMaximize,
      onClose,
      onNewConversation,
      onClear,
      onStartNewConversation,
      canStartNewConversation,
      canClear,
      closeIconComponent: CloseIcon,
      minimizeIconComponent: MinimizeIcon,
      maximizeIconComponent: MaximizeIcon,
      titleIconComponent: TitleIcon,
      newConversationIconComponent: NewConversationIcon,
      classNames = {},
      translations: userTranslations,
      ...props
    } = userProps;
    const t = userTranslations ?? {};
    const translations: Required<ChatHeaderTranslations> = {
      title: 'Chat',
      minimizeLabel: 'Minimize chat',
      maximizeLabel: 'Maximize chat',
      closeLabel: 'Close chat',
      newConversationLabel: 'Start a new conversation',
      ...t,
    };

    const resolvedNewConversation = onNewConversation ?? onClear;
    const handleStartNewConversation =
      onStartNewConversation ?? resolvedNewConversation;
    const startNewConversationDisabled =
      resolvedNewConversation !== undefined &&
      !(canStartNewConversation ?? canClear ?? false);

    const defaultMaximizeIcon = maximized ? (
      <MinimizeIconDefault createElement={createElement} />
    ) : (
      <MaximizeIconDefault createElement={createElement} />
    );

    return (
      <div
        className={cx('ais-ChatHeader', classNames.root, props.className)}
        {...props}
      >
        <span className={cx('ais-ChatHeader-title', classNames.title)}>
          <span
            className={cx('ais-ChatHeader-titleIcon', classNames.titleIcon)}
          >
            {TitleIcon ? (
              <TitleIcon />
            ) : (
              <SparklesIcon createElement={createElement} />
            )}
          </span>
          {translations.title}
        </span>
        <div className={cx('ais-ChatHeader-actions')}>
          {handleStartNewConversation && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              className={cx(
                'ais-ChatHeader-newConversation',
                classNames.newConversation
              )}
              onClick={handleStartNewConversation}
              disabled={startNewConversationDisabled}
              aria-label={translations.newConversationLabel}
              title={translations.newConversationLabel}
              type="button"
            >
              {NewConversationIcon ? (
                <NewConversationIcon />
              ) : (
                <SquarePenIcon createElement={createElement} />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            className={cx('ais-ChatHeader-maximize', classNames.maximize)}
            onClick={onToggleMaximize}
            aria-label={
              maximized
                ? translations.minimizeLabel
                : translations.maximizeLabel
            }
          >
            {MaximizeIcon ? (
              <MaximizeIcon maximized={maximized} />
            ) : (
              defaultMaximizeIcon
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            className={cx('ais-ChatHeader-close', classNames.close)}
            onClick={onClose}
            aria-label={translations.closeLabel}
            title={translations.closeLabel}
          >
            {CloseIcon ? (
              <CloseIcon />
            ) : (
              <CloseIconDefault createElement={createElement} />
            )}
          </Button>
        </div>
      </div>
    );
  };
}
