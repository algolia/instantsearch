import React from 'react';
import { useClearRefinements } from 'react-instantsearch-hooks';

import { ClearRefinements as ClearRefinementsUiComponent } from '../ui/ClearRefinements';

import type { ClearRefinementsProps as ClearRefinementsUiComponentProps } from '../ui/ClearRefinements';
import type { UseClearRefinementsProps } from 'react-instantsearch-hooks';

type UiProps = Pick<
  ClearRefinementsUiComponentProps,
  'disabled' | 'onClick' | 'translations'
>;

export type ClearRefinementsProps = Omit<
  ClearRefinementsUiComponentProps,
  keyof UiProps
> &
  UseClearRefinementsProps;

export function ClearRefinements({
  includedAttributes,
  excludedAttributes,
  transformItems,
  ...props
}: ClearRefinementsProps) {
  const { canRefine, refine } = useClearRefinements(
    {
      includedAttributes,
      excludedAttributes,
      transformItems,
    },
    {
      $$widgetType: 'ais.clearRefinements',
    }
  );

  const uiProps: UiProps = {
    onClick: refine,
    disabled: !canRefine,
    translations: {
      resetLabel: 'Clear refinements',
    },
  };

  return <ClearRefinementsUiComponent {...props} {...uiProps} />;
}
