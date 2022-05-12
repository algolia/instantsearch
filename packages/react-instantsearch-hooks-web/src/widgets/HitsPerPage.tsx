import React from 'react';
import { useHitsPerPage } from 'react-instantsearch-hooks';

import { HitsPerPage as HitsPerPageUiComponent } from '../ui/HitsPerPage';

import type { HitsPerPageProps as HitsPerPageUiComponentProps } from '../ui/HitsPerPage';
import type { UseHitsPerPageProps } from 'react-instantsearch-hooks';

type UiProps = Pick<
  HitsPerPageUiComponentProps,
  'items' | 'onChange' | 'currentValue'
>;

export type HitsPerPageProps = Omit<
  HitsPerPageUiComponentProps,
  keyof UiProps
> &
  UseHitsPerPageProps;

export function HitsPerPage(props: HitsPerPageProps) {
  const { items, refine } = useHitsPerPage(props, {
    $$widgetType: 'ais.hitsPerPage',
  });
  const { value: currentValue } =
    items.find(({ isRefined }) => isRefined)! || {};

  const uiProps: UiProps = {
    items,
    currentValue,
    onChange: (value) => refine(value),
  };

  return <HitsPerPageUiComponent {...props} {...uiProps} />;
}
