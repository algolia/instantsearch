import {
  Range,
  RangeBoundaries,
} from 'instantsearch.js/es/connectors/range/connectRange';
import React, { useState } from 'react';
import {
  Slider,
  Rail,
  Handles,
  Tracks,
  Ticks,
  GetHandleProps,
} from 'react-compound-slider';
import { useRange } from 'react-instantsearch-hooks-web';

import './PriceSlider.css';
import { formatNumber } from '../utils';

function Handle({
  domain: [min, max],
  handle: { id, value, percent },
  disabled,
  getHandleProps,
}: {
  domain: [number, number];
  handle: { id: string; value: number; percent: number };
  disabled?: boolean;
  getHandleProps: GetHandleProps;
}) {
  return (
    <>
      {/* Dummy element to make the tooltip draggable */}
      <div
        style={{
          position: 'absolute',
          left: `${percent}%`,
          width: 40,
          height: 25,
          transform: 'translate(-50%, -100%)',
          cursor: disabled ? 'not-allowed' : 'grab',
          zIndex: 1,
        }}
        aria-hidden={true}
        {...getHandleProps(id)}
      />
      <div
        role="slider"
        className="slider-handle"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        style={{
          left: `${percent}%`,
          cursor: disabled ? 'not-allowed' : 'grab',
        }}
        {...getHandleProps(id)}
      />
    </>
  );
}

function convertToTicks(start: RangeBoundaries, range: Range): number[] {
  const domain =
    range.min === 0 && range.max === 0
      ? { min: undefined, max: undefined }
      : range;

  return [
    start[0] === -Infinity ? domain.min! : start[0]!,
    start[1] === Infinity ? domain.max! : start[1]!,
  ];
}

export function PriceSlider({
  attribute,
  min,
  max,
}: {
  attribute: string;
  min?: number;
  max?: number;
}) {
  const { range, start, refine, canRefine } = useRange(
    {
      attribute,
      min,
      max,
    },
    { $$widgetType: 'e-commerce.rangeSlider' }
  );
  const [ticksValues, setTicksValues] = useState(convertToTicks(start, range));
  const [prevStart, setPrevStart] = useState(start);

  if (start !== prevStart) {
    setTicksValues(convertToTicks(start, range));
    setPrevStart(start);
  }

  const onChange = (values: readonly number[]) => {
    refine(values as [number, number]);
  };

  const onUpdate = (values: readonly number[]) => {
    setTicksValues(values as [number, number]);
  };

  if (
    !canRefine ||
    ticksValues[0] === undefined ||
    ticksValues[1] === undefined
  ) {
    return null;
  }

  return (
    <Slider
      mode={2}
      step={1}
      domain={[range.min!, range.max!]}
      values={start as number[]}
      disabled={!canRefine}
      onChange={onChange}
      onUpdate={onUpdate}
      rootStyle={{ position: 'relative', marginTop: '1.5rem' }}
      className="ais-RangeSlider"
    >
      <Rail>
        {({ getRailProps }) => (
          <div className="slider-rail" {...getRailProps()} />
        )}
      </Rail>

      <Tracks left={false} right={false}>
        {({ tracks, getTrackProps }) => (
          <div>
            {tracks.map(({ id, source, target }) => (
              <div
                key={id}
                className="slider-track"
                style={{
                  left: `${source.percent}%`,
                  width: `${target.percent - source.percent}%`,
                }}
                {...getTrackProps()}
              />
            ))}
          </div>
        )}
      </Tracks>

      <Handles>
        {({ handles, getHandleProps }) => (
          <div>
            {handles.map((handle) => (
              <Handle
                key={handle.id}
                handle={handle}
                domain={[range.min!, range.max!]}
                getHandleProps={getHandleProps}
              />
            ))}
          </div>
        )}
      </Handles>

      <Ticks values={ticksValues}>
        {({ ticks }) => (
          <div>
            {ticks.map(({ id, value, percent }) => (
              <div
                key={id}
                className="slider-tick"
                style={{
                  left: `${percent}%`,
                }}
              >
                {/* @ts-ignore */}
                <span style={{ color: '#e2a400', marginRight: 4 }}>$</span>
                {formatNumber(value)}
              </div>
            ))}
          </div>
        )}
      </Ticks>
    </Slider>
  );
}
