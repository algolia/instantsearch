import React, { useState, useEffect } from 'react';
import { connectRange } from 'react-instantsearch-dom';
import { Slider, Rail, Handles, Tracks, Ticks } from 'react-compound-slider';
import { formatNumber } from '../utils';
import './PriceSlider.css';

function Handle({
  domain: [min, max],
  handle: { id, value, percent },
  disabled,
  getHandleProps,
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

const PriceSlider = ({ min, max, refine, currentRefinement, canRefine }) => {
  if (!canRefine) {
    return null;
  }

  const domain = [min, max];
  const [ticksValues, setTicksValues] = useState([
    currentRefinement.min,
    currentRefinement.max,
  ]);

  const onChange = values => {
    refine({ min: values[0], max: values[1] });
  };

  useEffect(() => {
    setTicksValues([currentRefinement.min, currentRefinement.max]);
  }, [currentRefinement]);

  return (
    <Slider
      mode={2}
      step={1}
      domain={domain}
      values={[currentRefinement.min, currentRefinement.max]}
      disabled={!canRefine}
      onChange={onChange}
      onUpdate={setTicksValues}
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
            {handles.map(handle => (
              <Handle
                key={handle.id}
                handle={handle}
                domain={domain}
                getHandleProps={getHandleProps}
              />
            ))}
          </div>
        )}
      </Handles>

      <Ticks values={ticksValues}>
        {({ ticks }) => (
          <div>
            {ticks.map(({ id, count, value, percent }) => (
              <div
                key={id}
                className="slider-tick"
                style={{
                  marginLeft: `${-(100 / count) / 2}%`,
                  width: `${100 / count}%`,
                  left: `${percent}%`,
                }}
              >
                <span style={{ color: '#e2a400', marginRight: 4 }}>$</span>
                {formatNumber(value)}
              </div>
            ))}
          </div>
        )}
      </Ticks>
    </Slider>
  );
};

export default connectRange(PriceSlider);
