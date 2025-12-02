/** @jsx createElement */

import { cx } from '../../lib/cx';

import type { ComponentProps, Renderer } from '../../types';

export type AutocompleteIndexProps<
  T = { objectID: string; __indexName: string } & Record<string, unknown>
> = {
  items: T[];
  HeaderComponent?: (props: { items: T[] }) => JSX.Element;
  ItemComponent: (props: { item: T; onSelect: () => void }) => JSX.Element;
  getItemProps: (
    item: T,
    index: number
  ) => Omit<ComponentProps<'li'>, 'onSelect'> & { onSelect: () => void };
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
   * Class names to apply to the header element
   */
  header: string | string[];
  /**
   * Class names to apply to each item element
   */
  item: string | string[];
};

export function createAutocompleteIndexComponent({ createElement }: Renderer) {
  return function AutocompleteIndex(userProps: AutocompleteIndexProps) {
    const {
      items,
      HeaderComponent,
      ItemComponent,
      getItemProps,
      classNames = {},
    } = userProps;

    return (
      <div className={cx('ais-AutocompleteIndex', classNames.root)}>
        {HeaderComponent && (
          <div className={cx('ais-AutocompleteIndexHeader', classNames.header)}>
            <HeaderComponent items={items} />
          </div>
        )}
        <ol className={cx('ais-AutocompleteIndexList', classNames.list)}>
          {items.map((item, index) => {
            const { className, onSelect, ...itemProps } = getItemProps(
              item,
              index
            );
            return (
              <li
                key={`${itemProps.id}:${item.objectID}`}
                {...itemProps}
                className={cx(
                  'ais-AutocompleteIndexItem',
                  classNames.item,
                  className
                )}
              >
                <ItemComponent item={item} onSelect={onSelect} />
              </li>
            );
          })}
        </ol>
      </div>
    );
  };
}
