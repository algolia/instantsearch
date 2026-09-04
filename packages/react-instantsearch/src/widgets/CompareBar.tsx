import { createCompareBarComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';
import { useCompare } from 'react-instantsearch-core';

import type {
  CompareBarClassNames,
  CompareBarItemComponentProps,
  CompareBarTranslations,
  Pragma,
} from 'instantsearch-ui-components';
import type { UseCompareProps } from 'react-instantsearch-core';

const CompareBarUiComponent = createCompareBarComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export type CompareBarProps = UseCompareProps & {
  /**
   * CSS classes to add to the widget elements.
   */
  classNames?: Partial<CompareBarClassNames>;

  /**
   * Translations for the widget's texts.
   */
  translations?: Partial<CompareBarTranslations>;

  /**
   * Custom renderer for a selected item's label.
   */
  itemComponent?: (props: CompareBarItemComponentProps) => JSX.Element;
};

/**
 * Renders the comparison selection bar: the records picked for comparison,
 * a clear-selection action, and the "Compare" call-to-action that opens the
 * `<Chat>` widget with the comparison message.
 *
 * Select records from your own UI (e.g. a "Compare" button in your hit
 * component) with `useCompare().toggleItem(hit)` — the selection is shared
 * with this widget.
 */
export function CompareBar({
  classNames,
  translations,
  itemComponent,
  ...props
}: CompareBarProps) {
  const {
    items,
    minItems,
    maxItems,
    canCompare,
    removeItem,
    clearItems,
    compare,
  } = useCompare(props, { $$widgetType: 'ais.compareBar' });

  return (
    <CompareBarUiComponent
      items={items}
      minItems={minItems}
      maxItems={maxItems}
      canCompare={canCompare}
      onCompare={() => compare()}
      onRemove={(item) => removeItem(item.objectID)}
      onClear={clearItems}
      itemComponent={itemComponent}
      classNames={classNames}
      translations={translations}
    />
  );
}
