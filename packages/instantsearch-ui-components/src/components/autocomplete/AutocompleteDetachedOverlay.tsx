/** @jsx createElement */

import { cx } from '../../lib/cx';

import type { AutocompleteClassNames } from './Autocomplete';
import type { ComponentChildren, Renderer } from '../../types';

export type AutocompleteDetachedOverlayProps = {
  children?: ComponentChildren;
  classNames?: Partial<AutocompleteClassNames>;
  onClose: () => void;
};

export function createAutocompleteDetachedOverlayComponent({
  createElement,
}: Renderer) {
  return function AutocompleteDetachedOverlay(
    props: AutocompleteDetachedOverlayProps
  ) {
    const { children, classNames = {}, onClose } = props;

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
