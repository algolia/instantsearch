/** @jsx createElement */

import { cx } from '../../lib/cx';

import type {
  ComponentChildren,
  ComponentProps,
  MutableRef,
  Renderer,
} from '../../types';

export type AutocompleteProps = Omit<ComponentProps<'div'>, 'children'> & {
  children?: ComponentChildren;
  classNames?: Partial<AutocompleteClassNames>;
  rootRef?: MutableRef<HTMLDivElement | null>;
};

export type AutocompleteClassNames = {
  /**
   * Class names to apply to the root element
   */
  root: string | string[];
  /**
   * Class names to apply to the detached overlay backdrop
   */
  detachedOverlay: string | string[];
  /**
   * Class names to apply to the detached container
   */
  detachedContainer: string | string[];
  /**
   * Class names to apply to the detached form container
   */
  detachedFormContainer: string | string[];
  /**
   * Class names to apply to the detached search button
   */
  detachedSearchButton: string | string[];
  /**
   * Class names to apply to the detached search button icon
   */
  detachedSearchButtonIcon: string | string[];
  /**
   * Class names to apply to the detached search button placeholder
   */
  detachedSearchButtonPlaceholder: string | string[];
  /**
   * Class names to apply to the detached search button query
   */
  detachedSearchButtonQuery: string | string[];
  /**
   * Class names to apply to the detached search button clear button
   */
  detachedSearchButtonClear: string | string[];
  /**
   * Class names to apply to the detached search button clear icon
   */
  detachedSearchButtonClearIcon: string | string[];
  /**
   * Class names to apply to the detached search button search icon
   */
  detachedSearchButtonSearchIcon: string | string[];
  /**
   * Class names to apply to the panel
   */
  panel: string | string[];
  /**
   * Class names to apply to the panel when open
   */
  panelOpen: string | string[];
  /**
   * Class names to apply to the panel layout
   */
  panelLayout: string | string[];
  /**
   * Class names to apply to the search form
   */
  form: string | string[];
  /**
   * Class names to apply to the input wrapper prefix
   */
  inputWrapperPrefix: string | string[];
  /**
   * Class names to apply to the back button
   */
  backButton: string | string[];
  /**
   * Class names to apply to the back button icon
   */
  backButtonIcon: string | string[];
  /**
   * Class names to apply to the label
   */
  label: string | string[];
  /**
   * Class names to apply to the submit button
   */
  submitButton: string | string[];
  /**
   * Class names to apply to the submit button icon
   */
  submitButtonIcon: string | string[];
  /**
   * Class names to apply to the loading indicator
   */
  loadingIndicator: string | string[];
  /**
   * Class names to apply to the loading indicator icon
   */
  loadingIndicatorIcon: string | string[];
  /**
   * Class names to apply to the input wrapper
   */
  inputWrapper: string | string[];
  /**
   * Class names to apply to the search input
   */
  input: string | string[];
  /**
   * Class names to apply to the input wrapper suffix
   */
  inputWrapperSuffix: string | string[];
  /**
   * Class names to apply to the reset button
   */
  resetButton: string | string[];
  /**
   * Class names to apply to the reset button icon
   */
  resetButtonIcon: string | string[];
  /**
   * Class names to apply to the AI mode button
   */
  aiModeButton: string | string[];
  /**
   * Class names to apply to the AI mode button icon
   */
  aiModeButtonIcon: string | string[];
  /**
   * Class names to apply to the AI mode button label
   */
  aiModeButtonLabel: string | string[];
};

export function createAutocompleteComponent({ createElement }: Renderer) {
  return function Autocomplete(userProps: AutocompleteProps) {
    const { children, classNames = {}, rootRef, ...props } = userProps;

    return (
      <div
        className={cx('ais-Autocomplete', classNames.root)}
        ref={rootRef}
        {...props}
      >
        {children}
      </div>
    );
  };
}
