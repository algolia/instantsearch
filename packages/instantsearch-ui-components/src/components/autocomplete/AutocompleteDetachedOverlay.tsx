/** @jsx createElement */

import { cx } from '../../lib/cx';

import type { ComponentChildren, Renderer } from '../../types';
import type { AutocompleteClassNames } from './Autocomplete';

export type AutocompleteDetachedOverlayProps = {
  children?: ComponentChildren;
  classNames?: Partial<AutocompleteClassNames>;
  onClose: () => void;
};

export function createAutocompleteDetachedOverlayComponent({
  createElement,
}: Renderer) {
  return function AutocompleteDetachedOverlay(
    userProps: AutocompleteDetachedOverlayProps
  ) {
    const { children, classNames = {}, onClose } = userProps;

    return (
      <div
        className={cx(
          'ais-AutocompleteDetachedOverlay',
          classNames.detachedOverlay
        )}
        onMouseDown={onClose}
      >
        {children}
      </div>
    );
  };
}
