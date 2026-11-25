import { createSearchBoxComponent, cx } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';

import type {
  Pragma,
  SearchBoxIconComponent as SharedIconComponent,
} from 'instantsearch-ui-components';

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
  /**
   * Class names to apply to the AI mode label
   */
  aiModeLabel: string;
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
  /**
   * The accessible name of the input.
   */
  inputAriaLabel?: string;
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
    aiModeButtonDisabled?: boolean;
    classNames?: Partial<SearchBoxClassNames>;
    translations: SearchBoxTranslations;
  };

// The loading and AI mode icons use camelCase SVG attributes (React warns on
// the kebab-case ones the shared defaults use).
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

const SearchBoxUiComponent = createSearchBoxComponent({
  createElement: createElement as Pragma,
  Fragment,
});

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
  resetIconComponent,
  submitIconComponent,
  loadingIconComponent = DefaultLoadingIcon,
  aiModeIconComponent = DefaultAiModeIcon,
  onAiModeClick,
  aiModeButtonDisabled = false,
  classNames = {},
  translations,
  ...props
}: SearchBoxProps) {
  return (
    <SearchBoxUiComponent
      {...(props as Record<string, unknown>)}
      formRef={formRef}
      inputRef={inputRef}
      inputProps={{
        ...(inputProps as Record<string, unknown>),
        onChange,
        onCompositionEnd: onChange,
      }}
      isSearchStalled={isSearchStalled}
      onSubmit={
        onSubmit &&
        ((event) =>
          onSubmit(event as unknown as React.FormEvent<HTMLFormElement>))
      }
      onReset={(event) =>
        onReset(event as unknown as React.FormEvent<HTMLFormElement>)
      }
      placeholder={placeholder}
      value={value}
      autoFocus={autoFocus}
      submitIconComponent={submitIconComponent as SharedIconComponent}
      resetIconComponent={resetIconComponent as SharedIconComponent}
      loadingIconComponent={loadingIconComponent as SharedIconComponent}
      aiModeIconComponent={aiModeIconComponent as SharedIconComponent}
      onAiModeClick={onAiModeClick}
      aiModeButtonDisabled={aiModeButtonDisabled}
      classNames={classNames}
      translations={translations}
    />
  );
}
