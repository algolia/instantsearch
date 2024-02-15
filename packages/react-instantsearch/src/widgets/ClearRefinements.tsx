import React from 'react';
import { useClearRefinements } from 'react-instantsearch-core';

import { ClearRefinements as ClearRefinementsUiComponent } from '../ui/ClearRefinements';

import type { ClearRefinementsProps as ClearRefinementsUiComponentProps } from '../ui/ClearRefinements';
import type { UseClearRefinementsProps } from 'react-instantsearch-core';

type UiProps = Pick<
  ClearRefinementsUiComponentProps,
  'disabled' | 'onClick' | 'translations'
>;

export type ClearRefinementsProps = Omit<
  ClearRefinementsUiComponentProps,
  keyof UiProps
> &
  UseClearRefinementsProps & {
    translations?: Partial<UiProps['translations']>;
  };

export function ClearRefinements({
  includedAttributes,
  excludedAttributes,
  transformItems,
  translations,
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
      resetButtonText: 'Clear refinements',
      ...translations,
    },
  };

  return <ClearRefinementsUiComponent {...props} {...uiProps} />;
}
