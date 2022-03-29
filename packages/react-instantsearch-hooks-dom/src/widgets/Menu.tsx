import React from 'react';
import { useMenu } from 'react-instantsearch-hooks';

import { Menu as MenuUiComponent } from '../ui/Menu';

import type { MenuProps as MenuUiComponentProps } from '../ui/Menu';
import type { UseMenuProps } from 'react-instantsearch-hooks';

export type MenuProps = Omit<
  MenuUiComponentProps,
  | 'items'
  | 'onRefine'
  | 'createURL'
  | 'noResults'
  | 'canToggleShowMore'
  | 'onToggleShowMore'
  | 'isShowingMore'
> &
  UseMenuProps;

export function Menu({
  attribute,
  limit,
  showMore,
  showMoreLimit,
  sortBy,
  transformItems,
  ...props
}: MenuProps) {
  const {
    canToggleShowMore,
    isShowingMore,
    items,
    refine,
    createURL,
    toggleShowMore,
  } = useMenu(
    {
      attribute,
      limit,
      showMore,
      showMoreLimit,
      sortBy,
      transformItems,
    },
    {
      $$widgetType: 'ais.menu',
    }
  );

  return (
    <MenuUiComponent
      {...props}
      items={items}
      createURL={createURL}
      onRefine={(item) => {
        refine(item.value);
      }}
      showMore={showMore}
      canToggleShowMore={canToggleShowMore}
      onToggleShowMore={toggleShowMore}
      isShowingMore={isShowingMore}
    />
  );
}
