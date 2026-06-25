/** @jsx createElement */
import { cx } from '../../lib/cx';

import {
  AiModeIcon,
  BackIcon,
  ClearIcon,
  LoadingIcon,
  SubmitIcon,
} from './icons';

import type { ComponentProps, Renderer } from '../..';
import type { AutocompleteClassNames } from './Autocomplete';

export type AutocompleteSearchProps = {
  inputProps: ComponentProps<'input'>;
  onClear: () => void;
  query: string;
  isSearchStalled: boolean;
  onCancel?: () => void;
  isDetached?: boolean;
  submitTitle?: string;
  onAiModeClick?: () => void;
  aiModeButtonDisabled?: boolean;
  classNames?: Partial<AutocompleteClassNames>;
};

export function createAutocompleteSearchComponent({ createElement }: Renderer) {
  return function AutocompleteSearch(userProps: AutocompleteSearchProps) {
    const {
      inputProps,
      onClear,
      query,
      isSearchStalled,
      onCancel,
      isDetached,
      submitTitle,
      onAiModeClick,
      aiModeButtonDisabled = false,
      classNames = {},
    } = userProps;

    const isBackButton = Boolean(isDetached && onCancel);
    const resolvedCancelTitle = submitTitle ?? 'Close';
    const inputRef = inputProps.ref as { current: HTMLInputElement | null };

    return (
      <form
        className={cx('ais-AutocompleteForm', classNames.form)}
        action=""
        noValidate
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
        }}
        onReset={() => inputRef.current?.focus()}
      >
        <div
          className={cx(
            'ais-AutocompleteInputWrapperPrefix',
            classNames.inputWrapperPrefix
          )}
        >
          {isBackButton && (
            <button
              className={cx(
                'ais-AutocompleteBackButton',
                classNames.backButton
              )}
              type="button"
              title={resolvedCancelTitle}
              onClick={onCancel}
              hidden={isSearchStalled}
            >
              <BackIcon
                createElement={createElement}
                className={classNames.backButtonIcon}
              />
            </button>
          )}
          {/* Always render the label so aria-labelledby on the input keeps working */}
          <label
            className={cx('ais-AutocompleteLabel', classNames.label)}
            aria-label="Submit"
            htmlFor={inputProps.id}
            id={`${inputProps.id}-label`}
            hidden={isBackButton || undefined}
          >
            <button
              className={cx(
                'ais-AutocompleteSubmitButton',
                classNames.submitButton
              )}
              type="submit"
              title="Submit"
              hidden={isSearchStalled}
            >
              <SubmitIcon
                createElement={createElement}
                className={classNames.submitButtonIcon}
              />
            </button>
          </label>
          <div
            className={cx(
              'ais-AutocompleteLoadingIndicator',
              classNames.loadingIndicator
            )}
            hidden={!isSearchStalled}
          >
            <LoadingIcon
              createElement={createElement}
              isSearchStalled={isSearchStalled}
              className={classNames.loadingIndicatorIcon}
            />
          </div>
        </div>
        <div
          className={cx(
            'ais-AutocompleteInputWrapper',
            classNames.inputWrapper
          )}
        >
          <input
            className={cx('ais-AutocompleteInput', classNames.input)}
            aria-autocomplete="both"
            aria-labelledby={`${inputProps.id}-label`}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            enterKeyHint="search"
            spellCheck="false"
            maxLength={512}
            type="search"
            value={query}
            {...inputProps}
          />
        </div>
        <div
          className={cx(
            'ais-AutocompleteInputWrapperSuffix',
            classNames.inputWrapperSuffix
          )}
        >
          <button
            className={cx(
              'ais-AutocompleteClearButton',
              classNames.resetButton
            )}
            type="reset"
            title="Clear"
            hidden={query.length === 0 || isSearchStalled}
            onClick={onClear}
          >
            <ClearIcon
              createElement={createElement}
              className={classNames.resetButtonIcon}
            />
          </button>
          {onAiModeClick && (
            <button
              className={cx('ais-AiModeButton', classNames.aiModeButton)}
              type="button"
              title="AI Mode"
              disabled={aiModeButtonDisabled}
              onClick={(e) => {
                e.preventDefault();
                onAiModeClick();
              }}
            >
              <AiModeIcon
                createElement={createElement}
                className={classNames.aiModeButtonIcon}
              />
              <span
                className={cx(
                  'ais-AiModeButton-label',
                  classNames.aiModeButtonLabel
                )}
              >
                AI Mode
              </span>
            </button>
          )}
        </div>
      </form>
    );
  };
}
