import React from 'react';
import { useNumericMenu } from 'react-instantsearch-core';

import { NumericMenu as NumericMenuUiComponent } from '../ui/NumericMenu';

import type { NumericMenuProps as NumericMenuUiComponentProps } from '../ui/NumericMenu';
import type { UseNumericMenuProps } from 'react-instantsearch-core';

type UiProps = Pick<
  NumericMenuUiComponentProps,
  'items' | 'attribute' | 'onRefine'
>;

export type NumericMenuProps = Omit<NumericMenuUiComponentProps, keyof UiProps> &
  UseNumericMenuProps;

export function NumericMenu({
  attribute,
  items,
  transformItems,
  ...props
}: NumericMenuProps) {
  const { items: refinementItems, refine } = useNumericMenu(
    {
      attribute,
      items,
      transformItems,
    },
    {
      $$widgetType: 'ais.numericMenu',
    }
  );

  const uiProps: UiProps = {
    items: refinementItems,
    attribute,
    onRefine: refine,
  };

  return <NumericMenuUiComponent {...props} {...uiProps} />;
}
