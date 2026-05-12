import React from 'react';
import { useMenu } from 'react-instantsearch-core';

import { MenuSelect as MenuSelectUiComponent } from '../ui/MenuSelect';

import type { MenuSelectProps as MenuSelectUiComponentProps } from '../ui/MenuSelect';
import type { UseMenuProps } from 'react-instantsearch-core';

type UiProps = Pick<MenuSelectUiComponentProps, 'items' | 'value' | 'onChange'>;

export type MenuSelectProps = Omit<MenuSelectUiComponentProps, keyof UiProps> &
  Omit<UseMenuProps, 'showMore' | 'showMoreLimit'>;

export function MenuSelect({
  attribute,
  limit,
  sortBy,
  transformItems,
  ...props
}: MenuSelectProps) {
  const { items, refine } = useMenu(
    {
      attribute,
      limit,
      sortBy,
      transformItems,
    },
    {
      $$widgetType: 'ais.menuSelect',
    }
  );

  const selected = items.find((item) => item.isRefined);

  const uiProps: UiProps = {
    items,
    value: selected ? selected.value : '',
    onChange: refine,
  };

  return <MenuSelectUiComponent {...props} {...uiProps} />;
}
