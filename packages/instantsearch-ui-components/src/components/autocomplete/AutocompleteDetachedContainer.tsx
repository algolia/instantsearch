/** @jsx createElement */

import { cx } from '../../lib/cx';

import type { ComponentChildren, Renderer } from '../../types';
import type { AutocompleteClassNames } from './Autocomplete';

export type AutocompleteDetachedContainerProps = {
  children?: ComponentChildren;
  classNames?: Partial<AutocompleteClassNames>;
};

export function createAutocompleteDetachedContainerComponent({
  createElement,
}: Renderer) {
  return function AutocompleteDetachedContainer(
    userProps: AutocompleteDetachedContainerProps
  ) {
    const { children, classNames = {} } = userProps;

    return (
      <div
        className={cx(
          'ais-AutocompleteDetachedContainer',
          classNames.detachedContainer
        )}
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >
        {children}
      </div>
    );
  };
}
