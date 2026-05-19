/** @jsx createElement */

import { cx } from '../../lib/cx';

import type { AutocompleteClassNames } from './Autocomplete';
import type { ComponentChildren, Renderer } from '../../types';

export type AutocompleteDetachedFormContainerProps = {
  children?: ComponentChildren;
  classNames?: Partial<AutocompleteClassNames>;
};

export function createAutocompleteDetachedFormContainerComponent({
  createElement,
}: Renderer) {
  return function AutocompleteDetachedFormContainer(
    userProps: AutocompleteDetachedFormContainerProps
  ) {
    const { children, classNames = {} } = userProps;

    return (
      <div
        className={cx(
          'ais-AutocompleteDetachedFormContainer',
          classNames.detachedFormContainer
        )}
      >
        {children}
      </div>
    );
  };
}
