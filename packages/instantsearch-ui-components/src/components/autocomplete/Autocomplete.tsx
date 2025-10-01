/** @jsx createElement */

import { cx } from '../../lib/cx';

import type { ComponentChildren, Renderer } from '../../types';

export type AutocompleteProps = {
  isOpen: boolean;
  children?: ComponentChildren;
  classNames?: Partial<AutocompleteClassNames>;
};

export type AutocompleteClassNames = {
  /**
   * Class names to apply to the root element
   */
  root: string | string[];
};

export function createAutocompleteComponent({ createElement }: Renderer) {
  return function Autocomplete(userProps: AutocompleteProps) {
    const { children, isOpen, classNames = {} } = userProps;

    return (
      <div
        className={cx('ais-Autocomplete', classNames.root)}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {children}
      </div>
    );
  };
}
