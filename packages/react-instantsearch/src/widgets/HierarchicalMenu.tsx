import React from 'react';
import { useHierarchicalMenu } from 'react-instantsearch-core';

import { HierarchicalMenu as HierarchicalMenuUiComponent } from '../ui/HierarchicalMenu';

import type { HierarchicalMenuProps as HierarchicalMenuUiComponentProps } from '../ui/HierarchicalMenu';
import type { UseHierarchicalMenuProps } from 'react-instantsearch-core';

type UiProps = Pick<
  HierarchicalMenuUiComponentProps,
  | 'items'
  | 'createURL'
  | 'onRefine'
  | 'canToggleShowMore'
  | 'onToggleShowMore'
  | 'isShowingMore'
  | 'translations'
>;

export type HierarchicalMenuProps = Omit<
  HierarchicalMenuUiComponentProps,
  keyof UiProps
> &
  UseHierarchicalMenuProps & {
    translations?: UiProps['translations'];
  };

export function HierarchicalMenu({
  attributes,
  limit,
  rootPath,
  separator,
  showMore,
  showMoreLimit,
  showParentLevel,
  sortBy,
  transformItems,
  translations,
  ...props
}: HierarchicalMenuProps) {
  const {
    items,
    canToggleShowMore,
    createURL,
    isShowingMore,
    refine,
    toggleShowMore,
  } = useHierarchicalMenu(
    {
      attributes,
      limit,
      rootPath,
      separator,
      showMore,
      showMoreLimit,
      showParentLevel,
      sortBy,
      transformItems,
    },
    {
      $$widgetType: 'ais.hierarchicalMenu',
    }
  );

  const uiProps: UiProps = {
    items,
    createURL,
    onRefine: (item) => refine(item.value),
    canToggleShowMore,
    onToggleShowMore: toggleShowMore,
    isShowingMore,
    translations,
  };

  return (
    <HierarchicalMenuUiComponent {...props} {...uiProps} showMore={showMore} />
  );
}
