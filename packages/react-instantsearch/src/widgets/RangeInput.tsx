import React from 'react';
import { useRange } from 'react-instantsearch-core';

import { RangeInput as RangeInputUiComponent } from '../ui/RangeInput';

import type { RangeInputProps as RangeInputUiProps } from '../ui/RangeInput';
import type { UseRangeProps } from 'react-instantsearch-core';

type UiProps = Pick<
  RangeInputUiProps,
  'disabled' | 'onSubmit' | 'range' | 'start' | 'step' | 'translations'
>;

export type RangeInputProps = Omit<RangeInputUiProps, keyof UiProps> &
  UseRangeProps & { translations?: Partial<UiProps['translations']> };

export function RangeInput({
  attribute,
  min,
  max,
  precision,
  translations,
  ...props
}: RangeInputProps) {
  const { range, start, canRefine, refine } = useRange(
    { attribute, min, max, precision },
    { $$widgetType: 'ais.rangeInput' }
  );

  const step = 1 / Math.pow(10, precision || 0);

  const uiProps: UiProps = {
    range,
    start,
    step,
    disabled: !canRefine,
    onSubmit: refine,
    translations: {
      separatorElementText: 'to',
      submitButtonText: 'Go',
      ...translations,
    },
  };

  return <RangeInputUiComponent {...props} {...uiProps} />;
}
