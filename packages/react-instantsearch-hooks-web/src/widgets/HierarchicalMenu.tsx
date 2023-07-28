import React from 'react';
import { useHierarchicalMenu } from 'react-instantsearch-hooks';

import { HierarchicalMenu as HierarchicalMenuUiComponent } from '../ui/HierarchicalMenu';

import type { HierarchicalMenuProps as HierarchicalMenuUiComponentProps } from '../ui/HierarchicalMenu';
import type { UseHierarchicalMenuProps } from 'react-instantsearch-hooks';

type UiProps = Pick<
  HierarchicalMenuUiComponentProps,
  | 'items'
  | 'createURL'
  | 'hasItems'
  | 'onNavigate'
  | 'canToggleShowMore'
  | 'onToggleShowMore'
  | 'isShowingMore'
  | 'showMoreCount'
  | 'translations'
>;

export type HierarchicalMenuProps = Omit<
  HierarchicalMenuUiComponentProps,
  keyof UiProps
> &
  UseHierarchicalMenuProps & {
    translations?: Partial<UiProps['translations']>;
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
    canRefine,
    canToggleShowMore,
    createURL,
    isShowingMore,
    showMoreCount,
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
    hasItems: canRefine,
    createURL,
    onNavigate: refine,
    canToggleShowMore,
    onToggleShowMore: toggleShowMore,
    isShowingMore,
    showMoreCount,
    translations: {
      showMoreButtonText(options) {
        return options.isShowingMore ? 'Show less' : 'Show more';
      },
      ...translations,
    },
  };

  return (
    <HierarchicalMenuUiComponent {...props} {...uiProps} showMore={showMore} />
  );
}
