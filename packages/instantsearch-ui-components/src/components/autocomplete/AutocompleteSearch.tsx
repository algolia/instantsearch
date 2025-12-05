/** @jsx createElement */
import { ClearIcon, LoadingIcon, SubmitIcon } from './icons';

import type { ComponentProps, Renderer } from '../..';

export type AutocompleteSearchProps = {
  inputProps: Partial<ComponentProps<'input'>>;
  onClear: () => void;
  query: string;
  isSearchStalled: boolean;
};

export function createAutocompleteSearchComponent({ createElement }: Renderer) {
  return function AutocompleteSearch(userProps: AutocompleteSearchProps) {
    const { inputProps, onClear, query, isSearchStalled } = userProps;
    const inputRef = inputProps.ref as { current: HTMLInputElement | null };
    return (
      <form
        className="ais-AutocompleteForm"
        action=""
        noValidate
        role="search"
        onSubmit={(e) => e.preventDefault()}
        onReset={() => inputRef.current?.focus()}
      >
        <div className="ais-AutocompleteInputWrapperPrefix">
          <label
            className="ais-AutocompleteLabel"
            aria-label="Submit"
            htmlFor={inputProps.id}
            id={`${inputProps.id}-label`}
          >
            <button
              className="ais-AutocompleteSubmitButton"
              type="submit"
              title="Submit"
            >
              <SubmitIcon createElement={createElement} />
            </button>
          </label>
          <div
            className="ais-AutocompleteLoadingIndicator"
            hidden={!isSearchStalled}
          >
            <LoadingIcon createElement={createElement} />
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
        </div>
      </form>
    );
  };
}
