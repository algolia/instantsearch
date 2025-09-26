/** @jsx createElement */

import { cx } from '../../lib/cx';

import type { Renderer } from '../../types';

export type AutocompleteIndexProps<
  T = { objectID: string } & Record<string, unknown>
> = {
  items: T[];
  ItemComponent: (item: T) => JSX.Element;
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
    const { items, ItemComponent, classNames = {} } = userProps;

    return (
      <div className={cx('ais-AutocompleteIndex', classNames.root)}>
        <ol className={cx('ais-AutocompleteIndexList', classNames.list)}>
          {items.map((item) => (
            <li
              key={item.objectID}
              className={cx('ais-AutocompleteIndexItem', classNames.item)}
            >
              <ItemComponent {...item} />
            </li>
          ))}
        </ol>
      </div>
    );
  };
}
