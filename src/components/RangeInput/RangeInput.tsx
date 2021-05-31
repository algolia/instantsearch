/** @jsx h */

import { h, Component } from 'preact';
import cx from 'classnames';
import Template from '../Template/Template';
import {
  RangeInputCSSClasses,
  RangeInputTemplates,
} from '../../widgets/range-input/range-input';
import { Range, RangeBoundaries } from '../../connectors/range/connectRange';

export type RangeInputComponentCSSClasses = {
  [TClassName in keyof RangeInputCSSClasses]: string;
};

export type RangeInputProps = {
  min?: number;
  max?: number;
  step: number;
  values: Partial<Range>;
  cssClasses: RangeInputComponentCSSClasses;
  templateProps: {
    templates: RangeInputTemplates;
  };
  refine(rangeValue: RangeBoundaries): void;
};

class RangeInput extends Component<RangeInputProps, Partial<Range>> {
  public state = {
    min: this.props.values.min,
    max: this.props.values.max,
  };

  public componentWillReceiveProps(nextProps: RangeInputProps) {
    this.setState({
      min: nextProps.values.min,
      max: nextProps.values.max,
    });
  }

  private onInput = (key: string) => (event: Event) => {
    const { value } = event.currentTarget as HTMLInputElement;

    this.setState({
      [key]: Number(value),
    });
  };

  private onSubmit = (event: Event) => {
    event.preventDefault();

    this.props.refine([this.state.min, this.state.max]);
  };

  public render() {
    const { min: minValue, max: maxValue } = this.state;
    const { min, max, step, cssClasses, templateProps } = this.props;
    const isDisabled = min && max ? min >= max : false;
    const hasRefinements = Boolean(minValue || maxValue);
    const rootClassNames = cx(cssClasses.root, {
      [cssClasses.noRefinement]: !hasRefinements,
    });

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
              value={minValue ?? ''}
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
              value={maxValue ?? ''}
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
