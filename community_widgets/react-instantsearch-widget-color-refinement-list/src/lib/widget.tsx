import React from 'react';
import { useRefinementList } from 'react-instantsearch-core';
import type { UseRefinementListProps } from 'react-instantsearch-core';
import type { RefinementListItem } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList';

import type { TranslationsType } from './component';
import { ColorRefinementListComponent } from './component';
import type { ColorHit, LayoutType, ShapeType } from './types';

export interface ColorRefinementListProps
  extends Omit<UseRefinementListProps, 'transformItems'> {
  sortByColor?: boolean;
  layout?: LayoutType;
  shape?: ShapeType;
  pinRefined?: boolean;
  separator?: string;
  className?: string;
  transformItems?: (items: RefinementListItem[]) => RefinementListItem[];
  translations?: TranslationsType;
}

export function ColorRefinementList({
  sortByColor,
  layout,
  shape,
  pinRefined,
  separator,
  className,
  translations,
  attribute,
  operator,
  limit,
  showMore,
  showMoreLimit,
  sortBy,
  escapeFacetValues,
  transformItems,
}: ColorRefinementListProps) {
  const {
    items,
    refine,
    canToggleShowMore,
    isShowingMore,
    toggleShowMore,
  } = useRefinementList(
    {
      attribute,
      operator,
      limit,
      showMore,
      showMoreLimit,
      sortBy,
      escapeFacetValues,
      transformItems,
    },
    {
      $$widgetType: 'cmty.colorRefinementList',
    }
  );

  return (
    <ColorRefinementListComponent
      items={items}
      refine={refine}
      sortByColor={sortByColor}
      layout={layout}
      shape={shape}
      pinRefined={pinRefined}
      limit={limit}
      showMore={showMore}
      showMoreLimit={showMoreLimit}
      separator={separator}
      className={className}
      translations={translations}
      canToggleShowMore={canToggleShowMore}
      isShowingMore={isShowingMore}
      toggleShowMore={toggleShowMore}
    />
  );
}
