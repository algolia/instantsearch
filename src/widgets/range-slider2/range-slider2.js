import times from 'lodash/times';
import range from 'lodash/range';
import memoize from 'lodash/memoize';
import has from 'lodash/has';

import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import Rheostat from 'rheostat';
import cx from 'classnames';

import connectRangeSlider from '../../connectors/range-slider/connectRangeSlider.js';
import {getContainerNode} from '../../lib/utils.js';

const handleChange = refine => ({values}) => {
  refine(values);
};

const createHandleComponent = (tooltips = true) => props => {
  const value = has(tooltips, 'format')
    ? tooltips.format(props['aria-valuenow'])
    : props['aria-valuenow'];

  return (
    <div
      {...props}
      className={ cx('ais-range-slider--handle', props.className)}
    >
      { tooltips
          ? <div className="ais-range-slider--tooltip">{value}</div>
          : null }
    </div>
  );
};

const PitComponent = ({style, children}) => {
  // first, end & middle
  const positionValue = Math.round(parseFloat(style.left));
  const shouldDisplayValue = [0, 50, 100].includes(positionValue);

  return (
    <div
      style={ {...style, marginLeft: positionValue === 100 ? '-2px' : 0} }
      className={ cx('ais-range-slider--marker ais-range-slider--marker-horizontal', {
        'ais-range-slider--marker-large': shouldDisplayValue,
      }) }
    >
      { shouldDisplayValue
          ? <div className="ais-range-slider--value">{ Math.round(children * 100) / 100 }</div>
          : null }
    </div>
  );
};

PitComponent.propTypes = {
  children: PropTypes.number.isRequired,
  style: PropTypes.shape({
    position: PropTypes.string.isRequired,
    left: PropTypes.string.isRequired,
  }),
};

// _.memoize the `pitPoints[]` for min/max pair values
// dont recompute this at every render, no needs
const computeDefaultPitPoints = memoize(({min, max}) => {
  const totalLenght = max - min;
  const steps = 34;
  const stepsLength = totalLenght / steps;

  const pitPoints = [min, ...times(steps - 1, step => min + stepsLength * (step + 1)), max]
    // bug with `key={ 0 }` and preact, see https://github.com/developit/preact/issues/642
    .map(pitPoint => pitPoint === 0 ? 0.00001 : pitPoint);

  return pitPoints;
}, ({min, max}) => `min:${min}|max:${max}`);

const computeSnapPoints = memoize(
  ({min, max, step}) => range(min, max + step, step),
  ({min, max, step}) => `min:${min}|max:${max}|step:${step}`
);

const renderer = ({
  containerNode,
  pips,
  step,
  tooltips,
}) => ({
  refine,
  range: {min, max},
  start,
}, isFirstRendering) => {
  if (isFirstRendering) return;

  const minValue = start[0] === -Infinity ? min : start[0];
  const maxValue = start[1] === Infinity ? max : start[1];

  const pitPoints = pips === true || pips === undefined || pips === false
    ? computeDefaultPitPoints({min, max})
    : pips;

  const snapPoints = computeSnapPoints({min, max, step});
  const HandleComponent = createHandleComponent(tooltips);

  ReactDOM.render(
    <Rheostat
      handle={ HandleComponent }
      onChange={ handleChange(refine) }
      min={ min }
      max={ max }
      pitComponent={ PitComponent }
      pitPoints={ pitPoints }
      snap={ true }
      snapPoints={ snapPoints }
      values={ [minValue, maxValue] }
    />,
    containerNode
  );
};

const usage = `Usage:
rangeSlider2({
  container,
  attributeName,
  [ min ],
  [ max ],
  [ pips = true ],
  [ step = 1 ],
  [ precision = 2 ]
});
`;

export default function rangeSlider2({
  container,
  attributeName,
  min,
  max,
  step = 1,
  pips = true,
  precision = 2,
  tooltips = true,
} = {}) {
  if (!container) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);
  const specializedRenderer = renderer({
    containerNode,
    step,
    pips,
    tooltips,
  });

  try {
    const makeWidget = connectRangeSlider(specializedRenderer);
    return makeWidget({attributeName, min, max, precision});
  } catch (e) {
    throw new Error(usage);
  }
}
