import React from 'react';
import { useMenu } from 'react-instantsearch-hooks';

import { Menu as MenuUiComponent } from '../ui/Menu';

import type { MenuProps as MenuUiComponentProps } from '../ui/Menu';
import type { UseMenuProps } from 'react-instantsearch-hooks';

type UiProps = Pick<
  MenuUiComponentProps,
  | 'items'
  | 'onRefine'
  | 'createURL'
  | 'canToggleShowMore'
  | 'onToggleShowMore'
  | 'isShowingMore'
>;

export type MenuProps = Omit<MenuUiComponentProps, keyof UiProps> &
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

  const uiProps: UiProps = {
    items,
    createURL,
    onRefine: (item) => refine(item.value),
    canToggleShowMore,
    onToggleShowMore: toggleShowMore,
    isShowingMore,
  };

  return <MenuUiComponent {...props} {...uiProps} showMore={showMore} />;
}
