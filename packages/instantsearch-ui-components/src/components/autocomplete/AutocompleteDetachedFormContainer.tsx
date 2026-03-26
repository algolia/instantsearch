/** @jsx createElement */

import { cx } from '../../lib/cx';

import type { ComponentChildren, Renderer } from '../../types';
import type { AutocompleteClassNames } from './Autocomplete';
import type { AutocompleteDetachedTranslations } from './AutocompleteDetachedSearchButton';

export type AutocompleteDetachedFormContainerProps = {
  children?: ComponentChildren;
  classNames?: Partial<AutocompleteClassNames>;
  onCancel: () => void;
  translations: AutocompleteDetachedTranslations;
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
