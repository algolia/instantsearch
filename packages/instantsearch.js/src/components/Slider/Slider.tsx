/** @jsx h */

import { cx } from 'instantsearch-ui-components';
import { h, Component } from 'preact';

import { range } from '../../lib/utils';

import Pit from './Pit';
import Rheostat from './Rheostat';

import type { RangeBoundaries } from '../../connectors';
import type { ComponentCSSClasses } from '../../types';
import type {
  RangeSliderCssClasses,
  RangeSliderWidgetParams,
} from '../../widgets/range-slider/range-slider';
import type { HandleProps } from './Rheostat';

export type RangeSliderComponentCSSClasses =
  ComponentCSSClasses<RangeSliderCssClasses>;

export type SliderProps = {
  refine: (values: RangeBoundaries) => void;
  min?: number;
  max?: number;
  values: RangeBoundaries;
  pips?: boolean;
  step?: number;
  tooltips?: RangeSliderWidgetParams['tooltips'];
  cssClasses: RangeSliderComponentCSSClasses;
};

class Slider extends Component<SliderProps> {
  private get isDisabled() {
    return this.props.min! >= this.props.max!;
  }

  private handleChange = ({ values }: { values: RangeBoundaries }) => {
    if (!this.isDisabled) {
      this.props.refine(values);
    }
  };

  // creates an array number where to display a pit point on the slider
  private computeDefaultPitPoints({ min, max }: { min: number; max: number }) {
    const totalLength = max - min;
    const steps = 34;
    const stepsLength = totalLength / steps;

    const pitPoints = [
      min,
      ...range({
        end: steps - 1,
      }).map((step) => min + stepsLength * (step + 1)),
      max,
    ];

    return pitPoints;
  }

  // creates an array of values where the slider should snap to
  private computeSnapPoints({
    min,
    max,
    step,
  }: {
    min: number;
    max: number;
    step?: number;
  }) {
    if (!step) return undefined;
    return [...range({ start: min, end: max, step }), max];
  }

  private createHandleComponent =
    (tooltips: RangeSliderWidgetParams['tooltips']) => (props: HandleProps) => {
      // display only two decimals after comma,
      // and apply `tooltips.format()` if any
      const roundedValue =
        Math.round(
          // have to cast as a string, as the value given to the prop is a number, but becomes a string when read
          parseFloat(props['aria-valuenow'] as unknown as string) * 100
        ) / 100;
      const value =
        typeof tooltips === 'object' && tooltips.format
          ? tooltips.format(roundedValue)
          : roundedValue;

      const className = cx(
        props.className,
        props['data-handle-key'] === 0 && 'rheostat-handle-lower',
        props['data-handle-key'] === 1 && 'rheostat-handle-upper'
      );

      const ariaLabel =
        props['data-handle-key'] === 0
          ? 'Minimum Filter Handle'
          : 'Maximum Filter Handle';

      return (
        <div {...props} className={className} aria-label={ariaLabel}>
          {tooltips && <div className="rheostat-tooltip">{value}</div>}
        </div>
      );
    };

  public render() {
    const { tooltips, step, pips, values, cssClasses } = this.props;

    // @TODO: figure out why this.props needs to be non-null asserted
    const { min, max } = this.isDisabled
      ? { min: this.props.min!, max: this.props.max! + 0.001 }
      : (this.props as Required<SliderProps>);

    const snapPoints = this.computeSnapPoints({ min, max, step });
    const pitPoints =
      pips === false ? [] : this.computeDefaultPitPoints({ min, max });

    return (
      <div
        className={cx(
          cssClasses.root,
          this.isDisabled && cssClasses.disabledRoot
        )}
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
          values={(this.isDisabled ? [min, max] : values) as [number, number]}
          disabled={this.isDisabled}
        />
      </div>
    );
  }
}

export default Slider;
