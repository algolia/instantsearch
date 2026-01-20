import React from 'react';
import { useCurrentRefinements } from 'react-instantsearch-core';

import { CurrentRefinements as CurrentRefinementsUiComponent } from '../ui/CurrentRefinements';

import type { CurrentRefinementsProps as CurrentRefinementsUiComponentProps } from '../ui/CurrentRefinements';
import type { UseCurrentRefinementsProps } from 'react-instantsearch-core';

type UiProps = Pick<
  CurrentRefinementsUiComponentProps,
  'items' | 'hasRefinements' | 'aiMode'
>;

export type CurrentRefinementsProps = Omit<
  CurrentRefinementsUiComponentProps,
  keyof UiProps
> &
  UseCurrentRefinementsProps;

export function CurrentRefinements({
  includedAttributes,
  excludedAttributes,
  transformItems,
  ...props
}: CurrentRefinementsProps) {
  const { items, canRefine, aiMode } = useCurrentRefinements(
    {
      includedAttributes,
      excludedAttributes,
      transformItems,
    },
    {
      $$widgetType: 'ais.currentRefinements',
    }
  );

  const uiProps: UiProps = {
    items,
    hasRefinements: canRefine,
    aiMode,
  };

  return <CurrentRefinementsUiComponent {...props} {...uiProps} />;
}
