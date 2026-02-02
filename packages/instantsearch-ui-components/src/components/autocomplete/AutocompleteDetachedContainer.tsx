/** @jsx createElement */

import { cx } from '../../lib/cx';
import { createButtonComponent } from '../Button';

import type { ComponentChildren, Renderer } from '../../types';
import type { AutocompleteClassNames } from './Autocomplete';
import type { AutocompleteDetachedTranslations } from './AutocompleteDetachedSearchButton';

export type AutocompleteDetachedContainerProps = {
  children?: ComponentChildren;
  classNames?: Partial<AutocompleteClassNames>;
};

export type AutocompleteDetachedFormContainerProps = {
  children?: ComponentChildren;
  classNames?: Partial<AutocompleteClassNames>;
  onCancel: () => void;
  translations: AutocompleteDetachedTranslations;
};

export function createAutocompleteDetachedContainerComponent({
  createElement,
}: Renderer) {
  return function AutocompleteDetachedContainer(
    props: AutocompleteDetachedContainerProps
  ) {
    const { children, classNames = {} } = props;

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

export function createAutocompleteDetachedFormContainerComponent({
  createElement,
}: Renderer) {
  const Button = createButtonComponent({ createElement });

  return function AutocompleteDetachedFormContainer(
    props: AutocompleteDetachedFormContainerProps
  ) {
    const { children, classNames = {}, onCancel, translations } = props;

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
