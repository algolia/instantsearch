/** @jsx createElement */
import { cx } from '../../lib';
import { createButtonComponent } from '../Button';

import {
  SparklesIcon,
  MaximizeIcon as MaximizeIconDefault,
  MinimizeIcon as MinimizeIconDefault,
  CloseIcon as CloseIconDefault,
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
   * Text for the clear button
   */
  clearLabel: string;
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
   * Class names to apply to the clear button element
   */
  clear?: string | string[];
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
   * Callback when the clear button is clicked
   */
  onClear?: () => void;
  /**
   * Whether the clear button is enabled
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

  return function ChatHeader({
    maximized = false,
    onToggleMaximize,
    onClose,
    onClear,
    canClear = false,
    closeIconComponent: CloseIcon,
    minimizeIconComponent: MinimizeIcon,
    maximizeIconComponent: MaximizeIcon,
    titleIconComponent: TitleIcon,
    classNames = {},
    translations: userTranslations,
    ...props
  }: ChatHeaderProps) {
    const translations: Required<ChatHeaderTranslations> = {
      title: 'Chat',
      minimizeLabel: 'Minimize chat',
      maximizeLabel: 'Maximize chat',
      closeLabel: 'Close chat',
      clearLabel: 'Clear',
      ...userTranslations,
    };

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
          {onClear && (
            <Button
              variant="ghost"
              size="sm"
              className={cx('ais-ChatHeader-clear', classNames.clear)}
              onClick={onClear}
              disabled={!canClear}
            >
              {translations.clearLabel}
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
