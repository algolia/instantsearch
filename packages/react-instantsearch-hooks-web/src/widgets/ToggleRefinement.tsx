import React from 'react';
import { useToggleRefinement } from 'react-instantsearch-hooks';

import { ToggleRefinement as ToggleRefinementUiComponent } from '../ui/ToggleRefinement';

import type { PartialKeys } from '../types';
import type { ToggleRefinementProps as ToggleRefinementUiComponentProps } from '../ui/ToggleRefinement';
import type { UseToggleRefinementProps } from 'react-instantsearch-hooks';

type UiProps = Pick<ToggleRefinementUiComponentProps, 'onChange' | 'checked'>;

export type ToggleRefinementProps = PartialKeys<
  Omit<ToggleRefinementUiComponentProps, keyof UiProps>,
  'label'
> &
  UseToggleRefinementProps;

export function ToggleRefinement({
  attribute,
  on,
  off,
  ...props
}: ToggleRefinementProps) {
  const { refine, value } = useToggleRefinement(
    { attribute, on, off },
    {
      $$widgetType: 'ais.toggleRefinement',
    }
  );

  const uiProps: UiProps = {
    checked: value.isRefined,
    onChange: (isChecked) => refine({ isRefined: !isChecked }),
  };

  return (
    <ToggleRefinementUiComponent label={value.name} {...props} {...uiProps} />
  );
}
