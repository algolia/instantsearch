/** @jsx createElement */
import { cx } from '../../lib';

import {
  SparklesIconComponent,
  MaximizeIconComponent as MaximizeIconComponentDefault,
  MinimizeIconComponent as MinimizeIconComponentDefault,
  CloseIconComponent as CloseIconComponentDefault,
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

export type ChatHeaderProps = ComponentProps<'div'> & {
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

export function createChatHeaderComponent({ createElement }: Renderer) {
  return function ChatHeader({
    maximized = false,
    onToggleMaximize,
    onClose,
    onClear,
    canClear = false,
    closeIconComponent: CloseIconComponent,
    minimizeIconComponent: MinimizeIconComponent,
    maximizeIconComponent: MaximizeIconComponent,
    titleIconComponent: TitleIconComponent,
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
      <MinimizeIconComponentDefault createElement={createElement} />
    ) : (
      <MaximizeIconComponentDefault createElement={createElement} />
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
            {TitleIconComponent ? (
              <TitleIconComponent />
            ) : (
              <SparklesIconComponent
                createElement={createElement}
                width={20}
                height={20}
              />
            )}
          </span>
          {translations.title}
        </span>
        <div className={cx('ais-ChatHeader-actions')}>
          {onClear && (
            <button
              className={cx('ais-ChatHeader-clear', classNames.clear)}
              onClick={onClear}
              disabled={!canClear}
              type="button"
            >
              {translations.clearLabel}
            </button>
          )}
          <button
            className={cx('ais-ChatHeader-maximize', classNames.maximize)}
            onClick={onToggleMaximize}
            aria-label={
              maximized
                ? translations.minimizeLabel
                : translations.maximizeLabel
            }
            type="button"
          >
            {MaximizeIconComponent ? (
              <MaximizeIconComponent maximized={maximized} />
            ) : (
              defaultMaximizeIcon
            )}
          </button>
          <button
            className={cx('ais-ChatHeader-close', classNames.close)}
            onClick={onClose}
            aria-label={translations.closeLabel}
            title={translations.closeLabel}
            type="button"
          >
            {CloseIconComponent ? (
              <CloseIconComponent />
            ) : (
              <CloseIconComponentDefault createElement={createElement} />
            )}
          </button>
        </div>
      </div>
    );
  };
}
