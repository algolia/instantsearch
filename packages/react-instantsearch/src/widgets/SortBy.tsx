import React from 'react';
import { useSortBy } from 'react-instantsearch-core';

import { SortBy as SortByUiComponent } from '../ui/SortBy';

import type { SortByProps as SortByUiComponentProps } from '../ui/SortBy';
import type { UseSortByProps } from 'react-instantsearch-core';

type UiProps = Pick<SortByUiComponentProps, 'items' | 'value' | 'onChange'>;

export type SortByProps = Omit<SortByUiComponentProps, keyof UiProps> &
  UseSortByProps;

export function SortBy({ items, transformItems, ...props }: SortByProps) {
  const { currentRefinement, options, refine } = useSortBy(
    {
      items,
      transformItems,
    },
    {
      $$widgetType: 'ais.sortBy',
    }
  );

  const uiProps: UiProps = {
    items: options,
    value: currentRefinement,
    onChange: refine,
  };

  return <SortByUiComponent {...props} {...uiProps} />;
}
