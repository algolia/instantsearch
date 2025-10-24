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
