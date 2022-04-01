import React from 'react';

import { cx } from './lib/cx';
import { isModifierClick } from './lib/isModifierClick';
import { ShowMoreButton } from './ShowMoreButton';

import type { useHierarchicalMenu } from 'react-instantsearch-hooks';

type HierarchicalMenuClassNames = {
  /**
   * Class names to apply to the root element
   */
  root: string;
  /**
   * Class names to apply to the root element when there are no refinements possible
   */
  rootNoRefinement: string;
  /**
   * Class names to apply to the list element
   */
  list: string;
  /**
   * Class names to apply to each item element
   */
  item: string;
  /**
   * Class names to apply to the selected item
   */
  itemSelected: string;
  /**
   * Class names to apply to each link element
   */
  link: string;
  /**
   * Class names to apply to the label of an item element
   */
  label: string;
  /**
   * Class names to apply to the count of an item element
   */
  count: string;
  /**
   * Class names to apply to the "Show more" button
   */
  showMore: string;
  /**
   * Class names to apply to the "Show more" button if it's disabled
   */
  showMoreDisabled: string;
};

type HierarchicalListProps = Pick<
  ReturnType<typeof useHierarchicalMenu>,
  'items' | 'createURL'
> & {
  classNames?: Partial<HierarchicalMenuClassNames>;
  onNavigate: (value: string) => void;
};

export type HierarchicalMenuProps = React.HTMLAttributes<HTMLDivElement> &
  HierarchicalListProps & {
    hasItems: boolean;
    showMore?: boolean;
    canToggleShowMore: boolean;
    onToggleShowMore: () => void;
    isShowingMore: boolean;
  };

function HierarchicalList({
  classNames = {},
  items,
  createURL,
  onNavigate,
}: HierarchicalListProps) {
  return (
    <ul className={cx('ais-HierarchicalMenu-list', classNames.list)}>
      {items.map((item) => (
        <li
          key={item.value}
          className={cx(
            'ais-HierarchicalMenu-item',
            classNames.item,
            item.isRefined &&
              cx('ais-HierarchicalMenu-item--selected', classNames.itemSelected)
          )}
        >
          <a
            className={cx('ais-HierarchicalMenu-link', classNames.link)}
            href={createURL(item.value)}
            onClick={(event) => {
              if (isModifierClick(event)) {
                return;
              }
              event.preventDefault();
              onNavigate(item.value);
            }}
          >
            <span
              className={cx('ais-HierarchicalMenu-labelText', classNames.label)}
            >
              {item.label}
            </span>
            <span
              className={cx('ais-HierarchicalMenu-count', classNames.count)}
            >
              {item.count}
            </span>
          </a>
          {Boolean(item.data) && (
            <HierarchicalList
              classNames={classNames}
              items={item.data!}
              onNavigate={onNavigate}
              createURL={createURL}
            />
          )}
        </li>
      ))}
    </ul>
  );
}

export function HierarchicalMenu({
  classNames = {},
  items,
  hasItems,
  onNavigate,
  createURL,
  showMore,
  canToggleShowMore,
  onToggleShowMore,
  isShowingMore,
  ...props
}: HierarchicalMenuProps) {
  return (
    <div
      {...props}
      className={cx(
        'ais-HierarchicalMenu',
        classNames.root,
        !hasItems &&
          cx('ais-HierarchicalMenu--noRefinement', classNames.rootNoRefinement),
        props.className
      )}
    >
      <HierarchicalList
        classNames={classNames}
        items={items}
        onNavigate={onNavigate}
        createURL={createURL}
      />
      {showMore && (
        <ShowMoreButton
          className={cx(
            'ais-HierarchicalMenu-showMore',
            classNames.showMore,
            !canToggleShowMore &&
              cx(
                'ais-HierarchicalMenu-showMore--disabled',
                classNames.showMoreDisabled
              )
          )}
          disabled={!canToggleShowMore}
          onClick={onToggleShowMore}
          isShowingMore={isShowingMore}
        />
      )}
    </div>
  );
}
