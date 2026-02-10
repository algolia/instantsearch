/** @jsx createElement */

import { cx } from '../../lib/cx';
import { createButtonComponent } from '../Button';

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
  const Button = createButtonComponent({ createElement });

  return function AutocompleteDetachedFormContainer(
    userProps: AutocompleteDetachedFormContainerProps
  ) {
    const { children, classNames = {}, onCancel, translations } = userProps;

    return (
      <div
        className={cx(
          'ais-AutocompleteDetachedFormContainer',
          classNames.detachedFormContainer
        )}
      >
        {children}
        <Button
          variant="ghost"
          className={cx(
            'ais-AutocompleteDetachedCancelButton',
            classNames.detachedCancelButton
          )}
          onTouchStart={(event) => {
            // Prevent onTouchStart from closing the panel
            // since it should be initiated by onClick only
            event.stopPropagation();
          }}
          onClick={onCancel}
        >
          {translations.detachedCancelButtonText}
        </Button>
      </div>
    );
  };
}
