/** @jsx h */

import { h, Component } from 'preact';
import Rheostat from './Rheostat';
import cx from 'classnames';
import { range } from '../../lib/utils';
import Pit from './Pit';
import { RangeBoundaries } from '../../connectors/range/connectRange';

export type SliderProps = {
  refine(values: RangeBoundaries): void;
  min?: number;
  max?: number;
  values: RangeBoundaries;
  pips?: boolean;
  step: number;
  tooltips?:
    | boolean
    | {
        format(value: number): string;
      };
  cssClasses: {
    root: string;
    disabledRoot: string;
  };
};

class Slider extends Component<SliderProps> {
  private get isDisabled() {
    return this.props.min! >= this.props.max!;
  }

  private handleChange = ({ values }) => {
    if (!this.isDisabled) {
      this.props.refine(values);
    }
  };

  // creates an array number where to display a pit point on the slider
  private computeDefaultPitPoints({ min, max }) {
    const totalLength = max - min;
    const steps = 34;
    const stepsLength = totalLength / steps;

    const pitPoints = [
      min,
      ...range({
        end: steps - 1,
      }).map(step => min + stepsLength * (step + 1)),
      max,
    ];

    return pitPoints;
  }

  // creates an array of values where the slider should snap to
  private computeSnapPoints({ min, max, step }) {
    if (!step) return undefined;
    return [...range({ start: min, end: max, step }), max];
  }

  private createHandleComponent = tooltips => props => {
    // display only two decimals after comma,
    // and apply `tooltips.format()` if any
    const roundedValue =
      Math.round(parseFloat(props['aria-valuenow']) * 100) / 100;
    const value =
      tooltips && tooltips.format
        ? tooltips.format(roundedValue)
        : roundedValue;

    const className = cx(props.className, {
      'rheostat-handle-lower': props['data-handle-key'] === 0,
      'rheostat-handle-upper': props['data-handle-key'] === 1,
    });

    return (
      <div {...props} className={className}>
        {tooltips && <div className="rheostat-tooltip">{value}</div>}
      </div>
    );
  };

  public render() {
    const { tooltips, step, pips, values, cssClasses } = this.props;

    const { min, max } = this.isDisabled
      ? { min: this.props.min, max: this.props.max! + 0.001 }
      : this.props;

    const snapPoints = this.computeSnapPoints({ min, max, step });
    const pitPoints =
      pips === false ? [] : this.computeDefaultPitPoints({ min, max });

    return (
      <div
        className={cx(cssClasses.root, {
          [cssClasses.disabledRoot]: this.isDisabled,
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
          values={(this.isDisabled ? [min, max] : values) as number[]}
          disabled={this.isDisabled}
        />
      </div>
    );
  }
}

export default Slider;
