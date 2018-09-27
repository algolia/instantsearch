import times from 'lodash/times';
import range from 'lodash/range';
import has from 'lodash/has';
import PropTypes from 'prop-types';
import React, { Component } from 'preact-compat';
import Rheostat from 'preact-rheostat';
import cx from 'classnames';

import Pit from './Pit.js';
import { component } from '../../lib/suit';

const suit = component('RangeSlider');

export class Slider extends Component {
  static propTypes = {
    refine: PropTypes.func.isRequired,
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    values: PropTypes.arrayOf(PropTypes.number).isRequired,
    pips: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    step: PropTypes.number.isRequired,
    tooltips: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.shape({ format: PropTypes.func.isRequired }),
    ]),
  };

  get isDisabled() {
    return this.props.min >= this.props.max;
  }

  handleChange = ({ values }) => {
    if (!this.isDisabled) {
      this.props.refine(values);
    }
  };

  // creates an array number where to display a pit point on the slider
  computeDefaultPitPoints({ min, max }) {
    const totalLength = max - min;
    const steps = 34;
    const stepsLength = totalLength / steps;

    const pitPoints = [
      min,
      ...times(steps - 1, step => min + stepsLength * (step + 1)),
      max,
    ];

    return pitPoints;
  }

  // creates an array of values where the slider should snap to
  computeSnapPoints({ min, max, step }) {
    if (!step) return undefined;
    return [...range(min, max, step), max];
  }

  createHandleComponent = tooltips => props => {
    // display only two decimals after comma,
    // and apply `tooltips.format()` if any`
    const roundedValue =
      Math.round(parseFloat(props['aria-valuenow']) * 100) / 100;
    const value = has(tooltips, 'format')
      ? tooltips.format(roundedValue)
      : roundedValue;

    const className = cx(suit({ descendantName: 'handle' }), props.className, {
      [suit({ descendantName: 'handle', modifierName: 'lower' })]:
        props['data-handle-key'] === 0,
      [suit({ descendantName: 'handle', modifierName: 'upper' })]:
        props['data-handle-key'] === 1,
    });

    return (
      <div {...props} className={className}>
        {tooltips ? (
          <div className={cx(suit({ descendantName: 'tooltip' }))}>{value}</div>
        ) : null}
      </div>
    );
  };

  render() {
    const { tooltips, step, pips, values } = this.props;

    const { min, max } = this.isDisabled
      ? { min: this.props.min, max: this.props.max + 0.001 }
      : this.props;

    const snapPoints = this.computeSnapPoints({ min, max, step });
    const pitPoints =
      pips === false ? [] : this.computeDefaultPitPoints({ min, max });

    return (
      <div
        className={cx(suit(), {
          [suit({ modifierName: 'disabled' })]: this.isDisabled,
        })}
      >
        <Rheostat
          handle={this.createHandleComponent(tooltips)}
          onChange={this.handleChange}
          min={min}
          max={max}
          pitComponent={Pit}
          pitPoints={pitPoints}
          snap={true}
          snapPoints={snapPoints}
          values={this.isDisabled ? [min, max] : values}
          disabled={this.isDisabled}
        />
      </div>
    );
  }
}

export default Slider;
