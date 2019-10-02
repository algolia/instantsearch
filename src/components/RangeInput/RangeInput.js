/** @jsx h */

import { h, Component } from 'preact';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Template from '../Template/Template';

class RangeInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      min: props.values.min,
      max: props.values.max,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      min: nextProps.values.min,
      max: nextProps.values.max,
    });
  }

  onInput = name => event => {
    this.setState({
      [name]: Number(event.currentTarget.value),
    });
  };

  onSubmit = event => {
    event.preventDefault();

    this.props.refine([this.state.min, this.state.max]);
  };

  render() {
    const { min: minValue, max: maxValue } = this.state;
    const { min, max, step, cssClasses, templateProps } = this.props;
    const isDisabled = min >= max;

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
              value={minValue}
              onInput={this.onInput('min')}
              placeholder={min}
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
              value={maxValue}
              onInput={this.onInput('max')}
              placeholder={max}
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

RangeInput.propTypes = {
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  step: PropTypes.number.isRequired,
  values: PropTypes.shape({
    min: PropTypes.number,
    max: PropTypes.number,
  }).isRequired,
  cssClasses: PropTypes.shape({
    root: PropTypes.string.isRequired,
    noRefinement: PropTypes.string.isRequired,
    form: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    input: PropTypes.string.isRequired,
    inputMin: PropTypes.string.isRequired,
    inputMax: PropTypes.string.isRequired,
    separator: PropTypes.string.isRequired,
    submit: PropTypes.string.isRequired,
  }).isRequired,
  templateProps: PropTypes.shape({
    templates: PropTypes.shape({
      separatorText: PropTypes.string.isRequired,
      submitText: PropTypes.string.isRequired,
    }).isRequired,
  }),
  refine: PropTypes.func.isRequired,
};

export default RangeInput;
