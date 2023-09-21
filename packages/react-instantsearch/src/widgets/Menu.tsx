import React from 'react';
import { useMenu } from 'react-instantsearch-core';

import { Menu as MenuUiComponent } from '../ui/Menu';

import type { MenuProps as MenuUiComponentProps } from '../ui/Menu';
import type { UseMenuProps } from 'react-instantsearch-core';

type UiProps = Pick<
  MenuUiComponentProps,
  | 'items'
  | 'onRefine'
  | 'createURL'
  | 'canToggleShowMore'
  | 'onToggleShowMore'
  | 'isShowingMore'
  | 'translations'
>;

export type MenuProps = Omit<MenuUiComponentProps, keyof UiProps> &
  UseMenuProps & { translations?: Partial<UiProps['translations']> };

export function Menu({
  attribute,
  limit,
  showMore,
  showMoreLimit,
  sortBy,
  transformItems,
  translations,
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
    translations: {
      showMoreButtonText(options) {
        return options.isShowingMore ? 'Show less' : 'Show more';
      },
      ...translations,
    },
  };

  return <MenuUiComponent {...props} {...uiProps} showMore={showMore} />;
}
