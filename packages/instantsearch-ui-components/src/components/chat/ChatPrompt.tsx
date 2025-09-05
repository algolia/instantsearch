/** @jsx createElement */

import { cx } from '../../lib';

import type { ComponentProps, Renderer } from '../../types';
import type { ChatStatus } from './types';

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
  ComponentProps<'form'>,
  'onInput' | 'onSubmit'
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
   * Optional class names
   */
  classNames?: Partial<ChatPromptClassNames>;
  /**
   * Optional translations
   */
  translations?: Partial<ChatPromptTranslations>;
  /**
   * Callback when the textarea value changes
   */
  onInput?: (value: string) => void;
  /**
   * Callback when the form is submitted
   */
  onSubmit?: (value: string) => void;
  /**
   * Callback when the stop button is clicked
   */
  onStop?: () => void;
};

function createDefaultSubmitIconComponent({
  createElement,
}: Pick<Renderer, 'createElement'>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill="currentColor"
        d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"
      />
    </svg>
  );
}

function createDefaultStopIconComponent({
  createElement,
}: Pick<Renderer, 'createElement'>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="4" y="4" width="8" height="8" rx="1" fill="currentColor" />
    </svg>
  );
}

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
      maxRows = 8,
      translations: userTranslations,
      onInput,
      onSubmit,
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
      textarea: cx('ais-ChatPrompt-textarea', classNames.textarea),
      actions: cx(
        'ais-ChatPrompt-actions',
        classNames.actions,
        disabled && 'ais-ChatPrompt-actions--disabled'
      ),
      submit: cx('ais-ChatPrompt-submit', classNames.submit),
      footer: cx('ais-ChatPrompt-footer', classNames.footer),
    };

    const hasValue =
      typeof value === 'string' ? value.trim() !== '' : Boolean(value);
    const canStop = status === 'submitted' || status === 'streaming';
    const buttonDisabled = (!hasValue && !canStop) || disabled;

    const handleSubmit = (event: any) => {
      event.preventDefault();

      if (!hasValue || canStop || disabled) {
        return;
      }

      onSubmit?.(value || '');
    };

    const handleTextareaInput = (event: any) => {
      const target = event.target as HTMLTextAreaElement;
      const newValue = target.value;

      onInput?.(newValue);
    };

    const handleKeyDown = (event: any) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        handleSubmit(event);
      }
      if (event.key === 'Escape') {
        (event.target as HTMLTextAreaElement).blur();
      }
    };

    const handleButtonClick = (event: any) => {
      if (canStop) {
        event.preventDefault();
        onStop?.();
      }
    };

    const SubmitIcon = canStop
      ? createDefaultStopIconComponent
      : createDefaultSubmitIconComponent;

    return (
      <form
        {...props}
        className={cx(cssClasses.root, props.className)}
        onSubmit={handleSubmit}
      >
        {HeaderComponent && (
          <div className={cx(cssClasses.header)}>
            <HeaderComponent />
          </div>
        )}

        <div className={cx(cssClasses.body)}>
          <textarea
            className={cx(cssClasses.textarea)}
            value={value}
            placeholder={placeholder || translations.textareaPlaceholder}
            aria-label={translations.textareaLabel}
            disabled={disabled}
            rows={2}
            style={{
              maxHeight: `${maxRows * 1.5}em`,
              resize: 'none',
              overflow: 'auto',
            }}
            onInput={handleTextareaInput}
            onKeyDown={handleKeyDown}
          />

          <div className={cx(cssClasses.actions)}>
            <button
              className={cx(cssClasses.submit)}
              disabled={buttonDisabled}
              title={(() => {
                if (disabled) return translations.disabledTooltip;
                if (buttonDisabled) return translations.emptyMessageTooltip;
                if (canStop) return translations.stopResponseTooltip;
                return translations.sendMessageTooltip;
              })()}
              onClick={handleButtonClick}
              data-status={status}
            >
              <SubmitIcon createElement={createElement} />
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
