/** @jsx createElement */

import { cx } from '../../lib/cx';

import type { ComponentProps, Renderer } from '../../types';

export type AutocompleteIndexProps<
  T = { objectID: string } & Record<string, unknown>
> = {
  items: T[];
  onSelect: (item: T) => void;
  ItemComponent: (props: { item: T; onSelect: () => void }) => JSX.Element;
  getItemProps: (item: T, index: number) => ComponentProps<'li'>;
  classNames?: Partial<AutocompleteIndexClassNames>;
};

export type AutocompleteIndexClassNames = {
  /**
   * Class names to apply to the root element
   **/
  root: string | string[];
  /**
   * Class names to apply to the list element
   */
  list: string | string[];
  /**
   * Class names to apply to each item element
   */
  item: string | string[];
};

export function createAutocompleteIndexComponent({ createElement }: Renderer) {
  return function AutocompleteIndex(userProps: AutocompleteIndexProps) {
    const {
      items,
      ItemComponent,
      getItemProps,
      onSelect,
      classNames = {},
    } = userProps;

    return (
      <div className={cx('ais-AutocompleteIndex', classNames.root)}>
        <ol className={cx('ais-AutocompleteIndexList', classNames.list)}>
          {items.map((item, index) => {
            const { className, ...itemProps } = getItemProps(item, index);
            return (
              <li
                key={item.objectID}
                {...itemProps}
                className={cx(
                  'ais-AutocompleteIndexItem',
                  classNames.item,
                  className
                )}
              >
                <ItemComponent item={item} onSelect={() => onSelect(item)} />
              </li>
            );
          })}
        </ol>
      </div>
    );
  };
}
