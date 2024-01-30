import { createFrequentlyBoughtTogetherComponent } from '@algolia/recommend-vdom';
import React, { createElement, Fragment } from 'react';
import { useFrequentlyBoughtTogether } from 'react-instantsearch-core';

import type { FrequentlyBoughtTogetherProps as FrequentlyBoughtTogetherUiProps } from '@algolia/recommend-vdom';
import type { UseFrequentlyBoughtTogetherProps } from 'react-instantsearch-core';

type UiProps = Pick<
  FrequentlyBoughtTogetherUiProps<Record<string, any>>,
  'items' | 'status'
>;

export type FrequentlyBoughtTogetherProps = Omit<
  FrequentlyBoughtTogetherUiProps<Record<string, any>>,
  keyof UiProps
> &
  UseFrequentlyBoughtTogetherProps;

const FrequentlyBoughtTogetherUiComponent =
  createFrequentlyBoughtTogetherComponent({
    // @ts-ignore
    createElement,
    Fragment,
  });

export function FrequentlyBoughtTogether({
  objectIDs,
  ...props
}: FrequentlyBoughtTogetherProps) {
  const { recommendations = [] } = useFrequentlyBoughtTogether(
    {
      objectIDs,
    },
    {
      $$widgetType: 'ais.currentRefinements',
    }
  );

  const uiProps: UiProps = {
    items: recommendations,
    status: 'idle',
  };

  return <FrequentlyBoughtTogetherUiComponent {...props} {...uiProps} />;
}
