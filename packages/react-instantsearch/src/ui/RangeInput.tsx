import { createRangeInputComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment, useState } from 'react';

import type {
  Pragma,
  RangeInputClassNames,
  RangeInputTranslations,
} from 'instantsearch-ui-components';
import type { useRange } from 'react-instantsearch-core';

export type {
  RangeInputClassNames,
  RangeInputTranslations,
} from 'instantsearch-ui-components';

type RangeRenderState = ReturnType<typeof useRange>;

export type RangeInputProps = Omit<React.ComponentProps<'div'>, 'onSubmit'> &
  Pick<RangeRenderState, 'range' | 'currentRefinement'> & {
    classNames?: Partial<RangeInputClassNames>;
    disabled: boolean;
    onSubmit: RangeRenderState['refine'];
    step?: number;
    translations: RangeInputTranslations;
  };

const RangeInputUiComponent = createRangeInputComponent({
  createElement: createElement as Pragma,
  Fragment,
});

function toInputValue(value: number | undefined) {
  return value === undefined ? '' : value.toString();
}

export function RangeInput({
  range: { min, max },
  currentRefinement: { min: minValue, max: maxValue },
  disabled,
  onSubmit,
  ...props
}: RangeInputProps) {
  const values = { from: toInputValue(minValue), to: toInputValue(maxValue) };
  const [prevValues, setPrevValues] = useState(values);
  const [{ from, to }, setRange] = useState(values);

  if (values.from !== prevValues.from || values.to !== prevValues.to) {
    setRange(values);
    setPrevValues(values);
  }

  return (
    <RangeInputUiComponent
      {...props}
      min={min}
      max={max}
      fromValue={from}
      toValue={to}
      canRefine={!disabled}
      onFromChange={(value) => setRange({ from: value, to })}
      onToChange={(value) => setRange({ from, to: value })}
      onSubmit={() => {
        onSubmit({
          min: from ? Number(from) : undefined,
          max: to ? Number(to) : undefined,
        });
      }}
    />
  );
}
