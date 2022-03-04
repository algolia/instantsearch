import React from 'react';
import { useSortBy } from 'react-instantsearch-hooks';

import { SortBy as SortByUiComponent } from '../ui/SortBy';

import type { SortByProps as SortByUiComponentProps } from '../ui/SortBy';
import type { UseSortByProps } from 'react-instantsearch-hooks';

export type SortByProps = Omit<
  SortByUiComponentProps,
  'items' | 'value' | 'onSelect'
> &
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

  return (
    <SortByUiComponent
      {...props}
      value={currentRefinement}
      items={options}
      onChange={refine}
    />
  );
}
