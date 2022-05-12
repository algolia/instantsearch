import React from 'react';
import { useRange } from 'react-instantsearch-hooks';

import { RangeInput as RangeInputUiComponent } from '../ui/RangeInput';

import type { RangeInputProps as RangeInputUiProps } from '../ui/RangeInput';
import type { UseRangeProps } from 'react-instantsearch-hooks';

type UiProps = Pick<
  RangeInputUiProps,
  'disabled' | 'onSubmit' | 'range' | 'start' | 'step' | 'translations'
>;

export type RangeInputProps = Omit<RangeInputUiProps, keyof UiProps> &
  UseRangeProps;

export function RangeInput({
  attribute,
  min,
  max,
  precision,
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
      separator: 'to',
      submit: 'Go',
    },
  };

  return <RangeInputUiComponent {...props} {...uiProps} />;
}
