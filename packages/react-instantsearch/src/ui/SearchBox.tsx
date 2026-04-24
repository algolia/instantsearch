import { cx } from 'instantsearch-ui-components';
import React from 'react';

export type IconProps = {
  classNames: Partial<SearchBoxClassNames>;
};

export type SearchBoxClassNames = {
  /**
   * Class names to apply to the root element
   */
  root: string;
  /**
   * Class names to apply to the form element
   */
  form: string;
  /**
   * Class names to apply to the input element
   */
  input: string;
  /**
   * Class names to apply to the submit button
   */
  submit: string;
  /**
   * Class names to apply to the reset button
   */
  reset: string;
  /**
   * Class names to apply to the loading indicator element
   */
  loadingIndicator: string;
  /**
   * Class names to apply to the submit icon
   */
  submitIcon: string;
  /**
   * Class names to apply to the reset icon
   */
  resetIcon: string;
  /**
   * Class names to apply to the loading icon
   */
  loadingIcon: string;
  /**
   * Class names to apply to the AI mode button
   */
  aiModeButton: string;
  /**
   * Class names to apply to the AI mode icon
   */
  aiModeIcon: string;
};

export type SearchBoxTranslations = {
  /**
   * The alternative text of the submit button.
   */
  submitButtonTitle: string;
  /**
   * The alternative text of the reset button.
   */
  resetButtonTitle: string;
  /**
   * The alternative text of the AI mode button.
   */
  aiModeButtonTitle?: string;
};

export type SearchBoxProps = Omit<
  React.ComponentProps<'div'>,
  'onSubmit' | 'onReset' | 'onChange'
> &
  Pick<React.ComponentProps<'form'>, 'onSubmit'> &
  Required<Pick<React.ComponentProps<'form'>, 'onReset'>> &
  Pick<React.ComponentProps<'input'>, 'placeholder' | 'autoFocus'> & {
    onChange?: (
      event:
        | React.ChangeEvent<HTMLInputElement>
        | React.CompositionEvent<HTMLInputElement>
    ) => void;
    formRef?: React.RefObject<HTMLFormElement | null>;
    inputRef: React.RefObject<HTMLInputElement | null>;
    inputProps?: Omit<
      React.ComponentProps<'input'>,
      'placeholder' | 'value' | 'onChange' | 'onCompositionEnd' | 'autoFocus'
    >;
    isSearchStalled: boolean;
    value: string;
    resetIconComponent?: React.JSXElementConstructor<IconProps>;
    submitIconComponent?: React.JSXElementConstructor<IconProps>;
    loadingIconComponent?: React.JSXElementConstructor<IconProps>;
    aiModeIconComponent?: React.JSXElementConstructor<IconProps>;
    onAiModeClick?: () => void;
    classNames?: Partial<SearchBoxClassNames>;
    translations: SearchBoxTranslations;
  };

function DefaultSubmitIcon({ classNames }: IconProps) {
  return (
    <svg
      className={cx('ais-SearchBox-submitIcon', classNames.submitIcon)}
      width="10"
      height="10"
      viewBox="0 0 40 40"
      aria-hidden="true"
    >
      <path d="M26.804 29.01c-2.832 2.34-6.465 3.746-10.426 3.746C7.333 32.756 0 25.424 0 16.378 0 7.333 7.333 0 16.378 0c9.046 0 16.378 7.333 16.378 16.378 0 3.96-1.406 7.594-3.746 10.426l10.534 10.534c.607.607.61 1.59-.004 2.202-.61.61-1.597.61-2.202.004L26.804 29.01zm-10.426.627c7.323 0 13.26-5.936 13.26-13.26 0-7.32-5.937-13.257-13.26-13.257C9.056 3.12 3.12 9.056 3.12 16.378c0 7.323 5.936 13.26 13.258 13.26z"></path>
    </svg>
  );
}

function DefaultResetIcon({ classNames }: IconProps) {
  return (
    <svg
      className={cx('ais-SearchBox-resetIcon', classNames.resetIcon)}
      viewBox="0 0 20 20"
      width="10"
      height="10"
      aria-hidden="true"
    >
      <path d="M8.114 10L.944 2.83 0 1.885 1.886 0l.943.943L10 8.113l7.17-7.17.944-.943L20 1.886l-.943.943-7.17 7.17 7.17 7.17.943.944L18.114 20l-.943-.943-7.17-7.17-7.17 7.17-.944.943L0 18.114l.943-.943L8.113 10z"></path>
    </svg>
  );
}

function DefaultLoadingIcon({ classNames }: IconProps) {
  return (
    <svg
      aria-label="Results are loading"
      width="16"
      height="16"
      viewBox="0 0 38 38"
      stroke="#444"
      className={cx('ais-SearchBox-loadingIcon', classNames.loadingIcon)}
      aria-hidden="true"
    >
      <g fill="none" fillRule="evenodd">
        <g transform="translate(1 1)" strokeWidth="2">
          <circle strokeOpacity=".5" cx="18" cy="18" r="18" />
          <path d="M36 18c0-9.94-8.06-18-18-18">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 18 18"
              to="360 18 18"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      </g>
    </svg>
  );
}

function DefaultAiModeIcon({ classNames }: IconProps) {
  return (
    <svg
      className={cx('ais-AiModeButton-icon', classNames.aiModeIcon)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 20 20"
      width="16"
      height="16"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M10 1.875c.27 0 .51.173.594.43l1.593 4.844a1.043 1.043 0 0 0 .664.664l4.844 1.593a.625.625 0 0 1 0 1.188l-4.844 1.593a1.043 1.043 0 0 0-.664.664l-1.593 4.844a.625.625 0 0 1-1.188 0l-1.593-4.844a1.042 1.042 0 0 0-.664-.664l-4.844-1.593a.625.625 0 0 1 0-1.188l4.844-1.593a1.042 1.042 0 0 0 .664-.664l1.593-4.844a.625.625 0 0 1 .594-.43ZM9 7.539A2.292 2.292 0 0 1 7.54 9L4.5 10l3.04 1A2.292 2.292 0 0 1 9 12.46l1 3.04 1-3.04A2.293 2.293 0 0 1 12.46 11l3.04-1-3.04-1A2.292 2.292 0 0 1 11 7.54L10 4.5 9 7.54ZM4.167 1.875c.345 0 .625.28.625.625v3.333a.625.625 0 0 1-1.25 0V2.5c0-.345.28-.625.625-.625ZM15.833 13.542c.345 0 .625.28.625.625V17.5a.625.625 0 1 1-1.25 0v-3.333c0-.345.28-.625.625-.625Z"
        clipRule="evenodd"
      />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M1.875 4.167c0-.346.28-.625.625-.625h3.333a.625.625 0 1 1 0 1.25H2.5a.625.625 0 0 1-.625-.625ZM13.542 15.833c0-.345.28-.625.625-.625H17.5a.625.625 0 0 1 0 1.25h-3.333a.625.625 0 0 1-.625-.625Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function SearchBox({
  formRef,
  inputRef,
  inputProps,
  isSearchStalled,
  onChange,
  onReset,
  onSubmit,
  placeholder = '',
  value,
  autoFocus,
  resetIconComponent: ResetIcon = DefaultResetIcon,
  submitIconComponent: SubmitIcon = DefaultSubmitIcon,
  loadingIconComponent: LoadingIcon = DefaultLoadingIcon,
  aiModeIconComponent: AiModeIcon = DefaultAiModeIcon,
  onAiModeClick,
  classNames = {},
  translations,
  ...props
}: SearchBoxProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (onSubmit) {
      onSubmit(event);
    }

    if (inputRef.current) {
      inputRef.current.blur();
    }
  }

  function handleReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();

    onReset(event);

    if (inputRef.current) {
      inputRef.current.focus();
    }
  }

  return (
    <div
      {...props}
      className={cx('ais-SearchBox', classNames.root, props.className)}
    >
      <form
        ref={formRef}
        action=""
        className={cx('ais-SearchBox-form', classNames.form)}
        noValidate
        onSubmit={handleSubmit}
        onReset={handleReset}
        role="search"
      >
        <input
          {...inputProps}
          ref={inputRef}
          className={cx(
            'ais-SearchBox-input',
            classNames.input,
            inputProps?.className
          )}
          aria-label="Search"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          placeholder={placeholder}
          spellCheck={false}
          maxLength={512}
          type="search"
          value={value}
          onChange={onChange}
          onCompositionEnd={onChange}
          autoFocus={autoFocus}
        />
        <button
          className={cx('ais-SearchBox-submit', classNames.submit)}
          type="submit"
          title={translations.submitButtonTitle}
        >
          <SubmitIcon classNames={classNames} />
        </button>
        <button
          className={cx('ais-SearchBox-reset', classNames.reset)}
          type="reset"
          title={translations.resetButtonTitle}
          hidden={value.length === 0 || isSearchStalled}
        >
          <ResetIcon classNames={classNames} />
        </button>
        {onAiModeClick && (
          <button
            className={cx(
              'ais-AiModeButton',
              classNames.aiModeButton
            )}
            type="button"
            title={translations.aiModeButtonTitle || 'AI Mode'}
            onClick={(e) => {
              e.preventDefault();
              onAiModeClick();
            }}
          >
            <AiModeIcon classNames={classNames} />
            <span className="ais-AiModeButton-label">
              {translations.aiModeButtonTitle || 'AI Mode'}
            </span>
          </button>
        )}
        <span
          className={cx(
            'ais-SearchBox-loadingIndicator',
            classNames.loadingIndicator
          )}
          hidden={!isSearchStalled}
        >
          <LoadingIcon classNames={classNames} />
        </span>
      </form>
    </div>
  );
}
