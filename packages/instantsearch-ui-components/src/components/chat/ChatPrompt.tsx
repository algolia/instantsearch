/** @jsx createElement */

import { useRef, useLayoutEffect, useCallback } from 'react';

import { cx } from '../../lib';

import { ArrowUpIconComponent, StopIconComponent } from './icons';

import type { ComponentProps, Renderer } from '../../types';
import type { ChatStatus } from './types';
import type { BaseSyntheticEvent, FormEvent, KeyboardEvent } from 'react';

export type ChatPromptTranslations = {
  /**
   * The label for the textarea
   */
  textareaLabel: string;
  /**
   * The placeholder text for the textarea
   */
  textareaPlaceholder: string;
  /**
   * The tooltip for the submit button when message is empty
   */
  emptyMessageTooltip: string;
  /**
   * The tooltip for the stop button
   */
  stopResponseTooltip: string;
  /**
   * The tooltip for the send button
   */
  sendMessageTooltip: string;
  /**
   * The tooltip when the chat prompt is disabled
   */
  disabledTooltip: string;
};

export type ChatPromptClassNames = {
  /**
   * Class names to apply to the root element
   */
  root: string | string[];
  /**
   * Class names to apply to the header element
   */
  header: string | string[];
  /**
   * Class names to apply to the body element
   */
  body: string | string[];
  /**
   * Class names to apply to the textarea element
   */
  textarea: string | string[];
  /**
   * Class names to apply to the actions container
   */
  actions: string | string[];
  /**
   * Class names to apply to the submit button
   */
  submit: string | string[];
  /**
   * Class names to apply to the footer element
   */
  footer: string | string[];
};

export type ChatPromptProps = Omit<
  ComponentProps<'textarea'>,
  'key' | 'ref'
> & {
  /**
   * Content to render above the textarea
   */
  headerComponent?: () => JSX.Element;
  /**
   * Content to render below the textarea
   */
  footerComponent?: () => JSX.Element;
  /**
   * The current value of the textarea
   */
  value?: string;
  /**
   * Placeholder text for the textarea
   */
  placeholder?: string;
  /**
   * The current status of the chat prompt
   */
  status?: ChatStatus;
  /**
   * Whether the component is disabled
   */
  disabled?: boolean;
  /**
   * Maximum number of rows for the textarea
   */
  maxRows?: number;
  /**
   * Whether to auto-focus the textarea when mounted
   */
  autoFocus?: boolean;
  /**
   * Optional class names
   */
  classNames?: Partial<ChatPromptClassNames>;
  /**
   * Optional translations
   */
  translations?: Partial<ChatPromptTranslations>;
  /**
   * Callback when the form is submitted
   */
  onSubmit?: (
    event: KeyboardEvent<HTMLTextAreaElement> | FormEvent<HTMLFormElement>
  ) => void;
  /**
   * Callback when the stop button is clicked
   */
  onStop?: () => void;
};

export function createChatPromptComponent({ createElement }: Renderer) {
  return function ChatPrompt(userProps: ChatPromptProps) {
    const {
      classNames = {},
      headerComponent: HeaderComponent,
      footerComponent: FooterComponent,
      value,
      placeholder,
      status = 'ready',
      disabled = false,
      maxRows = 5,
      autoFocus = true,
      translations: userTranslations,
      onInput,
      onSubmit,
      onKeyDown,
      onStop,
      ...props
    } = userProps;

    const translations: Required<ChatPromptTranslations> = {
      textareaLabel: 'Type your message...',
      textareaPlaceholder: 'Type your message...',
      emptyMessageTooltip: 'Message is empty',
      stopResponseTooltip: 'Stop response',
      sendMessageTooltip: 'Send message',
      disabledTooltip: 'Chat prompt is disabled',
      ...userTranslations,
    };

    const cssClasses: ChatPromptClassNames = {
      root: cx('ais-ChatPrompt', classNames.root),
      header: cx('ais-ChatPrompt-header', classNames.header),
      body: cx('ais-ChatPrompt-body', classNames.body),
      textarea: cx(
        'ais-ChatPrompt-textarea ais-Scrollbar',
        disabled && 'ais-ChatPrompt-textarea--disabled',
        classNames.textarea
      ),
      actions: cx(
        'ais-ChatPrompt-actions',
        classNames.actions,
        disabled && 'ais-ChatPrompt-actions--disabled'
      ),
      submit: cx('ais-ChatPrompt-submit', classNames.submit),
      footer: cx('ais-ChatPrompt-footer', classNames.footer),
    };

    const internalRef = useRef<HTMLTextAreaElement>(null);
    const lineHeightRef = useRef(0);
    const paddingRef = useRef(0);

    const hasValue =
      typeof value === 'string' ? value.trim() !== '' : Boolean(value);
    const canStop = status === 'submitted' || status === 'streaming';
    const buttonDisabled = (!hasValue && !canStop) || disabled;

    const adjustHeight = useCallback(() => {
      if (!internalRef.current) return;

      const textArea = internalRef.current;
      textArea.style.height = 'auto';
      const fullHeight = textArea.scrollHeight;

      if (maxRows > 0) {
        const maxHeight = maxRows * lineHeightRef.current + paddingRef.current;
        textArea.style.overflowY = fullHeight > maxHeight ? 'auto' : 'hidden';
        textArea.style.height = `${Math.min(fullHeight, maxHeight)}px`;
      } else {
        textArea.style.overflowY = 'hidden';
        textArea.style.height = `${fullHeight}px`;
      }
    }, [maxRows]);

    useLayoutEffect(() => {
      if (!internalRef.current) return;

      const textArea = internalRef.current;
      const styles = getComputedStyle(textArea);

      lineHeightRef.current = parseFloat(styles.lineHeight);

      const pt = parseFloat(styles.paddingTop);
      const pb = parseFloat(styles.paddingBottom);
      paddingRef.current = pt + pb;
    }, []);

    useLayoutEffect(() => {
      adjustHeight();
    }, [value, maxRows, adjustHeight]);

    useLayoutEffect(() => {
      if (!internalRef.current) return undefined;

      const ro = new ResizeObserver(() => adjustHeight());

      const textArea = internalRef.current;
      ro.observe(textArea);

      return () => ro.disconnect();
    }, [adjustHeight]);

    const handleSubmit = (
      event: KeyboardEvent<HTMLTextAreaElement> | FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      if (canStop) {
        onStop?.();
        return;
      }

      if (!hasValue) {
        return;
      }

      onSubmit?.(event);
    };

    const handleTextareaInput = (event: FormEvent<HTMLTextAreaElement>) => {
      adjustHeight();
      onInput?.(event);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
      onKeyDown?.(event);
      if (event.key === 'Enter' && !event.shiftKey) {
        handleSubmit(event);
      }
      if (event.key === 'Escape') {
        event.currentTarget.blur();
      }
    };

    const submitIcon = canStop ? (
      <StopIconComponent createElement={createElement} />
    ) : (
      <ArrowUpIconComponent createElement={createElement} />
    );

    return (
      <form
        className={cx(cssClasses.root, props.className)}
        onSubmit={handleSubmit}
      >
        {HeaderComponent && (
          <div className={cx(cssClasses.header)}>
            <HeaderComponent />
          </div>
        )}

        <div
          className={cx(cssClasses.body)}
          onClick={(e: BaseSyntheticEvent) => {
            if (e.target === internalRef.current) return;
            internalRef.current?.focus();
          }}
        >
          <textarea
            {...props}
            ref={internalRef}
            className={cx(cssClasses.textarea)}
            value={value}
            placeholder={placeholder || translations.textareaPlaceholder}
            aria-label={translations.textareaLabel}
            disabled={disabled}
            autoFocus={autoFocus}
            onInput={handleTextareaInput}
            onKeyDown={handleKeyDown}
          />

          <div className={cx(cssClasses.actions)}>
            <button
              type="submit"
              className={cx(cssClasses.submit)}
              disabled={buttonDisabled}
              aria-label={(() => {
                if (disabled) return translations.disabledTooltip;
                if (buttonDisabled) return translations.emptyMessageTooltip;
                if (canStop) return translations.stopResponseTooltip;
                return translations.sendMessageTooltip;
              })()}
              data-status={status}
            >
              {submitIcon}
            </button>
          </div>
        </div>

        {FooterComponent && (
          <div className={cx(cssClasses.footer)}>
            <FooterComponent />
          </div>
        )}
      </form>
    );
  };
}
