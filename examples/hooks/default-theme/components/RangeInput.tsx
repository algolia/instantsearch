import React, { useEffect, useState } from 'react';

import { useRange, UseRangeProps } from 'react-instantsearch-hooks';
import { cx } from '../cx';

export type RangeProps = React.ComponentProps<'div'> & UseRangeProps;

// if the default value is undefined, React considers the component uncontrolled initially, which we don't want 0 or NaN as the default value
const unsetNumberInputValue = '' as unknown as number;

export function RangeInput(props: RangeProps) {
  const {
    range: { min, max },
    start: [minValue, maxValue],
    canRefine,
    refine,
  } = useRange(props);
  const values = {
    min:
      minValue !== -Infinity && minValue !== min
        ? minValue
        : unsetNumberInputValue,
    max:
      maxValue !== Infinity && maxValue !== max
        ? maxValue
        : unsetNumberInputValue,
  };
  const [{ from, to }, setRange] = useState({
    from: values.min,
    to: values.max,
  });

  useEffect(() => {
    setRange({ from: values.min, to: values.max });
  }, [values.min, values.max]);

  return (
    <div
      className={cx(
        'ais-RangeInput',
        !canRefine && 'ais-RangeInput-noRefinement',
        props.className
      )}
    >
      <form
        className="ais-RangeInput-form"
        onSubmit={(event) => {
          event.preventDefault();
          refine([from, to]);
        }}
      >
        <input
          className="ais-RangeInput-input ais-RangeInput-input--min"
          type="number"
          min={min}
          max={max}
          value={from}
          placeholder={min ? min.toString() : ''}
          disabled={!canRefine}
          onChange={(event) =>
            setRange({ from: Number(event.currentTarget.value), to })
          }
        />
        <span className="ais-RangeInput-separator"> - </span>
        <input
          className="ais-RangeInput-input ais-RangeInput-input--max"
          type="number"
          min={min}
          max={max}
          value={to}
          placeholder={max ? max.toString() : ''}
          disabled={!canRefine}
          onChange={(event) =>
            setRange({ from, to: Number(event.currentTarget.value) })
          }
        />
        <button className="ais-RangeInput-submit" type="submit">
          Go
        </button>
      </form>
    </div>
  );
}
