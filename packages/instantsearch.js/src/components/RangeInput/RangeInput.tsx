/** @jsx h */

import { cx } from 'instantsearch-ui-components';
import { h, Component } from 'preact';

import Template from '../Template/Template';

import type {
  Range,
  RangeBoundaries,
} from '../../connectors/range/connectRange';
import type { ComponentCSSClasses } from '../../types';
import type {
  RangeInputCSSClasses,
  RangeInputTemplates,
} from '../../widgets/range-input/range-input';

export type RangeInputComponentCSSClasses =
  ComponentCSSClasses<RangeInputCSSClasses>;

export type RangeInputComponentTemplates = Required<RangeInputTemplates>;

export type RangeInputProps = {
  min?: number;
  max?: number;
  step: number;
  values: Partial<Range>;
  cssClasses: RangeInputComponentCSSClasses;
  templateProps: {
    templates: RangeInputComponentTemplates;
  };
  refine: (rangeValue: RangeBoundaries) => void;
};

// Strips leading `0` from a positive number value
function stripLeadingZeroFromInput(value: string): string {
  return value.replace(/^(0+)\d/, (part) => Number(part).toString());
}

class RangeInput extends Component<
  RangeInputProps,
  { min?: string; max?: string }
> {
  public state = {
    min: this.props.values.min?.toString(),
    max: this.props.values.max?.toString(),
  };

  public componentWillReceiveProps(nextProps: RangeInputProps) {
    this.setState({
      min: nextProps.values.min?.toString(),
      max: nextProps.values.max?.toString(),
    });
  }

  private onInput = (key: keyof typeof this.state) => (event: Event) => {
    const { value } = event.currentTarget as HTMLInputElement;

    this.setState({
      [key]: value,
    });
  };

  private onSubmit = (event: Event) => {
    event.preventDefault();

    const { min, max } = this.state;
    this.props.refine([
      min ? Number(min) : undefined,
      max ? Number(max) : undefined,
    ]);
  };

  public render() {
    const { min: minValue, max: maxValue } = this.state;
    const { min, max, step, cssClasses, templateProps } = this.props;
    const isDisabled = min && max ? min >= max : false;
    const hasRefinements = Boolean(minValue || maxValue);
    const rootClassNames = cx(
      cssClasses.root,
      !hasRefinements && cssClasses.noRefinement
    );

    return (
      <div className={rootClassNames}>
        <form className={cssClasses.form} onSubmit={this.onSubmit}>
          <label className={cssClasses.label}>
            <input
              className={cx(cssClasses.input, cssClasses.inputMin)}
              type="number"
              min={min}
              max={max}
              step={step}
              value={stripLeadingZeroFromInput(minValue ?? '')}
              onInput={this.onInput('min')}
              placeholder={min?.toString()}
              disabled={isDisabled}
            />
          </label>

          <Template
            {...templateProps}
            templateKey="separatorText"
            rootTagName="span"
            rootProps={{
              className: cssClasses.separator,
            }}
          />

          <label className={cssClasses.label}>
            <input
              className={cx(cssClasses.input, cssClasses.inputMax)}
              type="number"
              min={min}
              max={max}
              step={step}
              value={stripLeadingZeroFromInput(maxValue ?? '')}
              onInput={this.onInput('max')}
              placeholder={max?.toString()}
              disabled={isDisabled}
            />
          </label>

          <Template
            {...templateProps}
            templateKey="submitText"
            rootTagName="button"
            rootProps={{
              type: 'submit',
              className: cssClasses.submit,
              disabled: isDisabled,
            }}
          />
        </form>
      </div>
    );
  }
}

export default RangeInput;
