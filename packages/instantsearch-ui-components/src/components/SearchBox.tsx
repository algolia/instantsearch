/** @jsx createElement */
import { cx } from '../lib';

import type { ComponentProps, MutableRef, Renderer } from '../types';

export type SearchBoxClassNames = {
  /**
   * Class names to apply to the root element
   */
  root: string | string[];
  /**
   * Class names to apply to the form element
   */
  form: string | string[];
  /**
   * Class names to apply to the input element
   */
  input: string | string[];
  /**
   * Class names to apply to the submit button
   */
  submit: string | string[];
  /**
   * Class names to apply to the submit icon
   */
  submitIcon: string | string[];
  /**
   * Class names to apply to the reset button
   */
  reset: string | string[];
  /**
   * Class names to apply to the reset icon
   */
  resetIcon: string | string[];
  /**
   * Class names to apply to the loading indicator element
   */
  loadingIndicator: string | string[];
  /**
   * Class names to apply to the loading icon
   */
  loadingIcon: string | string[];
  /**
   * Class names to apply to the AI mode button
   */
  aiModeButton: string | string[];
  /**
   * Class names to apply to the AI mode icon
   */
  aiModeIcon: string | string[];
  /**
   * Class names to apply to the AI mode label
   */
  aiModeLabel: string | string[];
};

export type SearchBoxTranslations = {
  /**
   * The accessible name and tooltip (`title`) of the submit button.
   */
  submitButtonTitle: string;
  /**
   * The accessible name and tooltip (`title`) of the reset button.
   */
  resetButtonTitle: string;
  /**
   * The tooltip (`title`) and label of the AI mode button.
   */
  aiModeButtonTitle: string;
  /**
   * The accessible name (`aria-label`) of the input.
   */
  inputAriaLabel: string;
};

export type SearchBoxIconComponentProps = {
  classNames: Partial<SearchBoxClassNames>;
};

export type SearchBoxIconComponent = (
  props: SearchBoxIconComponentProps
) => JSX.Element | null;

export type SearchBoxProps = Omit<
  ComponentProps<'div'>,
  'onSubmit' | 'onReset' | 'onChange' | 'onInput'
> & {
  /**
   * The value of the input. The search box is always controlled: the flavor
   * keeps the value (and decides when to sync it with the search state).
   */
  value: string;
  placeholder?: string;
  autoFocus?: boolean;
  isSearchStalled?: boolean;
  /**
   * Ref to the input, used to blur it on submit and focus it on reset.
   */
  inputRef?: MutableRef<HTMLInputElement | null>;
  formRef?: MutableRef<HTMLFormElement | null>;
  /**
   * Props spread on the input. The flavor binds its change handlers here
   * with its own event names (`onChange` and `onCompositionEnd` in React,
   * `onInput` and `oncompositionend` in Preact, `onInput` and
   * `onCompositionEnd` in Vue).
   */
  inputProps?: ComponentProps<'input'>;
  /**
   * Called when the form is submitted, after preventing the native submit.
   */
  onSubmit?: (event: Event) => void;
  /**
   * Called when the form is reset, after preventing the native reset.
   */
  onReset?: (event: Event) => void;
  /**
   * Whether to show the submit button. When `false`, it's rendered `hidden`.
   * @default true
   */
  showSubmit?: boolean;
  /**
   * Whether to show the reset button when there's a query. When `false`,
   * it's always rendered `hidden`.
   * @default true
   */
  showReset?: boolean;
  /**
   * Whether to render the loading indicator.
   * @default true
   */
  showLoadingIndicator?: boolean;
  /**
   * Renders the AI mode button when provided.
   */
  onAiModeClick?: () => void;
  aiModeButtonDisabled?: boolean;
  /**
   * Overrides the content of the submit button.
   */
  submitIconComponent?: SearchBoxIconComponent;
  /**
   * Overrides the content of the reset button.
   */
  resetIconComponent?: SearchBoxIconComponent;
  /**
   * Overrides the content of the loading indicator.
   */
  loadingIconComponent?: SearchBoxIconComponent;
  /**
   * Overrides the icon of the AI mode button (its label is kept).
   */
  aiModeIconComponent?: SearchBoxIconComponent;
  /**
   * Overrides the whole content of the AI mode button (icon and label).
   */
  aiModeComponent?: SearchBoxIconComponent;
  classNames?: Partial<SearchBoxClassNames>;
  translations?: Partial<SearchBoxTranslations>;
};

const defaultTranslations: SearchBoxTranslations = {
  submitButtonTitle: 'Submit the search query',
  resetButtonTitle: 'Clear the search query',
  aiModeButtonTitle: 'AI Mode',
  inputAriaLabel: 'Search',
};

export function createSearchBoxComponent({
  createElement,
  Fragment,
}: Renderer) {
  function DefaultSubmitIcon({ classNames }: SearchBoxIconComponentProps) {
    return (
      <svg
        className={cx('ais-SearchBox-submitIcon', classNames.submitIcon)}
        width="10"
        height="10"
        viewBox="0 0 40 40"
        aria-hidden="true"
      >
        <path d="M26.804 29.01c-2.832 2.34-6.465 3.746-10.426 3.746C7.333 32.756 0 25.424 0 16.378 0 7.333 7.333 0 16.378 0c9.046 0 16.378 7.333 16.378 16.378 0 3.96-1.406 7.594-3.746 10.426l10.534 10.534c.607.607.61 1.59-.004 2.202-.61.61-1.597.61-2.202.004L26.804 29.01zm-10.426.627c7.323 0 13.26-5.936 13.26-13.26 0-7.32-5.937-13.257-13.26-13.257C9.056 3.12 3.12 9.056 3.12 16.378c0 7.323 5.936 13.26 13.258 13.26z" />
      </svg>
    );
  }

  function DefaultResetIcon({ classNames }: SearchBoxIconComponentProps) {
    return (
      <svg
        className={cx('ais-SearchBox-resetIcon', classNames.resetIcon)}
        viewBox="0 0 20 20"
        width="10"
        height="10"
        aria-hidden="true"
      >
        <path d="M8.114 10L.944 2.83 0 1.885 1.886 0l.943.943L10 8.113l7.17-7.17.944-.943L20 1.886l-.943.943-7.17 7.17 7.17 7.17.943.944L18.114 20l-.943-.943-7.17-7.17-7.17 7.17-.944.943L0 18.114l.943-.943L8.113 10z" />
      </svg>
    );
  }

  // These icons use kebab-case SVG attributes, which Preact and Vue set as
  // is. React expects camelCase (`fillRule`), so it passes its own icons.
  /* eslint-disable react/no-unknown-property */
  function DefaultLoadingIcon({ classNames }: SearchBoxIconComponentProps) {
    return (
      <svg
        aria-label="Results are loading"
        className={cx('ais-SearchBox-loadingIcon', classNames.loadingIcon)}
        width="16"
        height="16"
        viewBox="0 0 38 38"
        stroke="#444"
        aria-hidden="true"
      >
        <g fill="none" fill-rule="evenodd">
          <g transform="translate(1 1)" stroke-width="2">
            <circle stroke-opacity=".5" cx="18" cy="18" r="18" />
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

  function DefaultAiModeIcon({ classNames }: SearchBoxIconComponentProps) {
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
          fill-rule="evenodd"
          d="M10 1.875c.27 0 .51.173.594.43l1.593 4.844a1.043 1.043 0 0 0 .664.664l4.844 1.593a.625.625 0 0 1 0 1.188l-4.844 1.593a1.043 1.043 0 0 0-.664.664l-1.593 4.844a.625.625 0 0 1-1.188 0l-1.593-4.844a1.042 1.042 0 0 0-.664-.664l-4.844-1.593a.625.625 0 0 1 0-1.188l4.844-1.593a1.042 1.042 0 0 0 .664-.664l1.593-4.844a.625.625 0 0 1 .594-.43ZM9 7.539A2.292 2.292 0 0 1 7.54 9L4.5 10l3.04 1A2.292 2.292 0 0 1 9 12.46l1 3.04 1-3.04A2.293 2.293 0 0 1 12.46 11l3.04-1-3.04-1A2.292 2.292 0 0 1 11 7.54L10 4.5 9 7.54ZM4.167 1.875c.345 0 .625.28.625.625v3.333a.625.625 0 0 1-1.25 0V2.5c0-.345.28-.625.625-.625ZM15.833 13.542c.345 0 .625.28.625.625V17.5a.625.625 0 1 1-1.25 0v-3.333c0-.345.28-.625.625-.625Z"
          clip-rule="evenodd"
        />
        <path
          fill="currentColor"
          fill-rule="evenodd"
          d="M1.875 4.167c0-.346.28-.625.625-.625h3.333a.625.625 0 1 1 0 1.25H2.5a.625.625 0 0 1-.625-.625ZM13.542 15.833c0-.345.28-.625.625-.625H17.5a.625.625 0 0 1 0 1.25h-3.333a.625.625 0 0 1-.625-.625Z"
          clip-rule="evenodd"
        />
      </svg>
    );
  }
  /* eslint-enable react/no-unknown-property */

  return function SearchBox(userProps: SearchBoxProps) {
    const {
      value,
      placeholder = '',
      autoFocus,
      isSearchStalled = false,
      inputRef,
      formRef,
      inputProps,
      onSubmit,
      onReset,
      showSubmit = true,
      showReset = true,
      showLoadingIndicator = true,
      onAiModeClick,
      aiModeButtonDisabled = false,
      submitIconComponent: SubmitIcon = DefaultSubmitIcon,
      resetIconComponent: ResetIcon = DefaultResetIcon,
      loadingIconComponent: LoadingIcon = DefaultLoadingIcon,
      aiModeIconComponent: AiModeIcon = DefaultAiModeIcon,
      aiModeComponent: AiModeContent,
      classNames = {},
      translations: userTranslations,
      ...props
    } = userProps;

    const translations = { ...defaultTranslations, ...userTranslations };

    return (
      <div
        {...props}
        className={cx('ais-SearchBox', classNames.root, props.className)}
      >
        <form
          ref={formRef}
          action=""
          role="search"
          className={cx('ais-SearchBox-form', classNames.form)}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();

            onSubmit?.(event as unknown as Event);

            inputRef?.current?.blur();
          }}
          onReset={(event) => {
            event.preventDefault();
            event.stopPropagation();

            onReset?.(event as unknown as Event);

            inputRef?.current?.focus();
          }}
        >
          <input
            {...inputProps}
            ref={inputRef}
            className={cx(
              'ais-SearchBox-input',
              classNames.input,
              inputProps?.className
            )}
            type="search"
            value={value}
            placeholder={placeholder}
            // `false` would set `autofocus="false"` in Vue 3, which still
            // autofocuses.
            autoFocus={autoFocus || undefined}
            aria-label={translations.inputAriaLabel}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            // A string, because Preact removes the attribute for `false`.
            spellCheck="false"
            maxLength={512}
          />
          <button
            className={cx('ais-SearchBox-submit', classNames.submit)}
            type="submit"
            title={translations.submitButtonTitle}
            aria-label={translations.submitButtonTitle}
            hidden={!showSubmit}
          >
            <SubmitIcon classNames={classNames} />
          </button>
          <button
            className={cx('ais-SearchBox-reset', classNames.reset)}
            type="reset"
            title={translations.resetButtonTitle}
            aria-label={translations.resetButtonTitle}
            hidden={!showReset || !value.trim() || isSearchStalled}
          >
            <ResetIcon classNames={classNames} />
          </button>
          {onAiModeClick && (
            <button
              className={cx('ais-AiModeButton', classNames.aiModeButton)}
              type="button"
              title={translations.aiModeButtonTitle}
              disabled={aiModeButtonDisabled}
              onClick={(event) => {
                event.preventDefault();
                onAiModeClick();
              }}
            >
              {AiModeContent ? (
                <AiModeContent classNames={classNames} />
              ) : (
                <Fragment>
                  <AiModeIcon classNames={classNames} />
                  <span
                    className={cx(
                      'ais-AiModeButton-label',
                      classNames.aiModeLabel
                    )}
                  >
                    {translations.aiModeButtonTitle}
                  </span>
                </Fragment>
              )}
            </button>
          )}
          {showLoadingIndicator && (
            <span
              className={cx(
                'ais-SearchBox-loadingIndicator',
                classNames.loadingIndicator
              )}
              hidden={!isSearchStalled}
            >
              <LoadingIcon classNames={classNames} />
            </span>
          )}
        </form>
      </div>
    );
  };
}
