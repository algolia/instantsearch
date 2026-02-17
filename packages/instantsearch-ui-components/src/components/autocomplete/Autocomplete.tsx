/** @jsx createElement */

import { cx } from '../../lib/cx';

import type { ComponentChildren, ComponentProps, Renderer } from '../../types';

export type AutocompleteProps = Omit<ComponentProps<'div'>, 'children'> & {
  children?: ComponentChildren;
  classNames?: Partial<AutocompleteClassNames>;
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
   * Class names to apply to the detached cancel button
   */
  detachedCancelButton: string | string[];
};

export function createAutocompleteComponent({ createElement }: Renderer) {
  return function Autocomplete(userProps: AutocompleteProps) {
    const { children, classNames = {}, ...props } = userProps;

    return (
      <div className={cx('ais-Autocomplete', classNames.root)} {...props}>
        {children}
      </div>
    );
  };
}
