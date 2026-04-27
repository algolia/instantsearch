/** @jsx createElement */
import {
  AiModeIcon,
  BackIcon,
  ClearIcon,
  LoadingIcon,
  SubmitIcon,
} from './icons';

import type { ComponentProps, Renderer } from '../..';

export type AutocompleteSearchProps = {
  inputProps: ComponentProps<'input'>;
  onClear: () => void;
  query: string;
  isSearchStalled: boolean;
  onSubmit?: () => void;
  isDetached?: boolean;
  submitTitle?: string;
  onAiModeClick?: () => void;
};

export function createAutocompleteSearchComponent({ createElement }: Renderer) {
  return function AutocompleteSearch(userProps: AutocompleteSearchProps) {
    const {
      inputProps,
      onClear,
      query,
      isSearchStalled,
      onSubmit,
      isDetached,
      submitTitle,
      onAiModeClick,
    } = userProps;

    const isBackButton = Boolean(isDetached && onSubmit);
    const resolvedCancelTitle = submitTitle ?? 'Close';
    const inputRef = inputProps.ref as { current: HTMLInputElement | null };

    return (
      <form
        className="ais-AutocompleteForm"
        action=""
        noValidate
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
        }}
        onReset={() => inputRef.current?.focus()}
      >
        <div className="ais-AutocompleteInputWrapperPrefix">
          {isBackButton && (
            <button
              className="ais-AutocompleteBackButton"
              type="button"
              title={resolvedCancelTitle}
              onClick={onSubmit}
              hidden={isSearchStalled}
            >
              <BackIcon createElement={createElement} />
            </button>
          )}
          {/* Always render the label so aria-labelledby on the input keeps working */}
          <label
            className="ais-AutocompleteLabel"
            aria-label="Submit"
            htmlFor={inputProps.id}
            id={`${inputProps.id}-label`}
            hidden={isBackButton || undefined}
          >
            <button
              className="ais-AutocompleteSubmitButton"
              type="submit"
              title="Submit"
              hidden={isSearchStalled}
            >
              <SubmitIcon createElement={createElement} />
            </button>
          </label>
          <div
            className="ais-AutocompleteLoadingIndicator"
            hidden={!isSearchStalled}
          >
            <LoadingIcon
              createElement={createElement}
              isSearchStalled={isSearchStalled}
            />
          </div>
        </div>
        <div className="ais-AutocompleteInputWrapper">
          <input
            className="ais-AutocompleteInput"
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
        <div className="ais-AutocompleteInputWrapperSuffix">
          <button
            className="ais-AutocompleteClearButton"
            type="reset"
            title="Clear"
            hidden={query.length === 0 || isSearchStalled}
            onClick={onClear}
          >
            <ClearIcon createElement={createElement} />
          </button>
          {onAiModeClick && (
            <button
              className="ais-AiModeButton"
              type="button"
              title="AI Mode"
              onClick={(e) => {
                e.preventDefault();
                onAiModeClick();
              }}
            >
              <AiModeIcon createElement={createElement} />
              <span className="ais-AiModeButton-label">AI Mode</span>
            </button>
          )}
        </div>
      </form>
    );
  };
}
