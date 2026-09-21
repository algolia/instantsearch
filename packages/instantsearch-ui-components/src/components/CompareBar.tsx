/** @jsx createElement */

import { cx } from '../lib/cx';

import { createButtonComponent } from './Button';
import { CloseIcon } from './chat/icons';

import type { Renderer } from '../types';

/**
 * CompareBar — the "funnel into chat" selection bar.
 *
 * Shows the products the user picked for comparison (via `connectCompare` /
 * `useCompare`), lets them remove entries or clear the selection, and exposes
 * the primary "Compare" call-to-action that opens the chat and sends the
 * comparison message. The bar renders nothing while the selection is empty.
 */

/** A selected record. Only `objectID` is required; the label is derived from
 * `name`/`title` when present. */
export type CompareBarItem = {
  objectID: string;
} & Record<string, unknown>;

export type CompareBarClassNames = {
  /** Class names to apply to the root element. */
  root?: string | string[];
  /** Class names to apply to the header row (title + count). */
  header?: string | string[];
  /** Class names to apply to the title element. */
  title?: string | string[];
  /** Class names to apply to the selection count element. */
  count?: string | string[];
  /** Class names to apply to the selected-items list. */
  list?: string | string[];
  /** Class names to apply to each selected item. */
  item?: string | string[];
  /** Class names to apply to each item label. */
  itemLabel?: string | string[];
  /** Class names to apply to each item remove button. */
  itemRemove?: string | string[];
  /** Class names to apply to the hint element. */
  hint?: string | string[];
  /** Class names to apply to the actions row. */
  actions?: string | string[];
  /** Class names to apply to the clear button. */
  clearButton?: string | string[];
  /** Class names to apply to the compare button. */
  compareButton?: string | string[];
};

export type CompareBarTranslations = {
  /** Accessible label and heading of the bar. */
  title: string;
  /** Selection counter, e.g. "2 of 3". */
  countText: (count: number, maxItems: number) => string;
  /** Label of the primary call-to-action. */
  compareButtonText: (count: number) => string;
  /** Label of the clear-selection button. */
  clearButtonText: string;
  /** Accessible label of an item's remove button. */
  removeItemLabel: (itemLabel: string) => string;
  /** Hint shown while fewer than `minItems` items are selected. */
  minItemsHint: (minItems: number) => string;
  /** Hint shown when the selection limit is reached. */
  limitReachedHint: string;
};

const DEFAULT_TRANSLATIONS: CompareBarTranslations = {
  title: 'Compare',
  countText: (count, maxItems) => `${count} of ${maxItems}`,
  compareButtonText: (count) => `Compare ${count}`,
  clearButtonText: 'Clear all',
  removeItemLabel: (itemLabel) => `Remove ${itemLabel} from comparison`,
  minItemsHint: (minItems) =>
    `Select at least ${minItems} products to compare.`,
  limitReachedHint: 'Compare limit reached — remove a product to add another.',
};

export type CompareBarItemComponentProps = {
  item: CompareBarItem;
};

export type CompareBarProps = {
  /** Ordered selection, one entry per product. */
  items: CompareBarItem[];
  /** Minimum number of items required to start a comparison. */
  minItems: number;
  /** Maximum number of items that can be selected. */
  maxItems: number;
  /** Whether the primary call-to-action is enabled. */
  canCompare: boolean;
  /** Starts the comparison (opens the chat and sends the message). */
  onCompare: () => void;
  /** Removes one item from the selection. */
  onRemove: (item: CompareBarItem) => void;
  /** Clears the whole selection. */
  onClear: () => void;
  /** Optional custom renderer for an item's label. */
  itemComponent?: (props: CompareBarItemComponentProps) => JSX.Element;
  classNames?: Partial<CompareBarClassNames>;
  translations?: Partial<CompareBarTranslations>;
};

/** The display label of a selected record. */
function getCompareBarItemLabel(item: CompareBarItem): string {
  const label = item.name ?? item.title;
  return typeof label === 'string' && label !== '' ? label : item.objectID;
}

export function createCompareBarComponent({ createElement }: Renderer) {
  const Button = createButtonComponent({ createElement });

  return function CompareBar(userProps: CompareBarProps) {
    const {
      items,
      minItems,
      maxItems,
      canCompare,
      onCompare,
      onRemove,
      onClear,
      itemComponent: ItemComponent,
      classNames = {},
      translations: userTranslations,
    } = userProps;

    const translations: CompareBarTranslations = {
      ...DEFAULT_TRANSLATIONS,
      ...userTranslations,
    };

    if (items.length === 0) {
      return null;
    }

    const hint =
      items.length < minItems
        ? translations.minItemsHint(minItems)
        : items.length >= maxItems
          ? translations.limitReachedHint
          : undefined;

    return (
      <section
        className={cx('ais-CompareBar', classNames.root)}
        aria-label={translations.title}
      >
        <div className={cx('ais-CompareBar-header', classNames.header)}>
          <span className={cx('ais-CompareBar-title', classNames.title)}>
            {translations.title}
          </span>
          <span
            className={cx('ais-CompareBar-count', classNames.count)}
            aria-live="polite"
          >
            {translations.countText(items.length, maxItems)}
          </span>
        </div>
        <ul className={cx('ais-CompareBar-list', classNames.list)}>
          {items.map((item) => {
            const label = getCompareBarItemLabel(item);

            return (
              <li
                key={item.objectID}
                data-object-id={item.objectID}
                className={cx('ais-CompareBar-item', classNames.item)}
              >
                <span
                  className={cx(
                    'ais-CompareBar-itemLabel',
                    classNames.itemLabel
                  )}
                >
                  {ItemComponent ? <ItemComponent item={item} /> : label}
                </span>
                <button
                  type="button"
                  className={cx(
                    'ais-CompareBar-itemRemove',
                    classNames.itemRemove
                  )}
                  aria-label={translations.removeItemLabel(label)}
                  onClick={() => onRemove(item)}
                >
                  <CloseIcon createElement={createElement} />
                </button>
              </li>
            );
          })}
        </ul>
        {hint && (
          <div className={cx('ais-CompareBar-hint', classNames.hint)}>
            {hint}
          </div>
        )}
        <div className={cx('ais-CompareBar-actions', classNames.actions)}>
          <Button
            variant="outline"
            size="sm"
            className={cx('ais-CompareBar-clearButton', classNames.clearButton)}
            onClick={onClear}
          >
            {translations.clearButtonText}
          </Button>
          <Button
            variant="primary"
            size="md"
            className={cx(
              'ais-CompareBar-compareButton',
              classNames.compareButton
            )}
            disabled={!canCompare}
            onClick={onCompare}
          >
            {translations.compareButtonText(items.length)}
          </Button>
        </div>
      </section>
    );
  };
}
