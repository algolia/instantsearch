import React, { Component } from 'preact-compat';
import PropTypes from 'prop-types';

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

  onChange = name => event => {
    this.setState({
      [name]: event.currentTarget.value,
    });
  };

  onSubmit = event => {
    event.preventDefault();

    this.props.refine([this.state.min, this.state.max]);
  };

  render() {
    const { min: minValue, max: maxValue } = this.state;
    const { min, max, step, cssClasses, labels } = this.props;
    const isDisabled = min >= max;

    const hasRefinements = Boolean(minValue || maxValue);
    const rootClassNames = hasRefinements
      ? cssClasses.root
      : `${cssClasses.root} ${cssClasses.noRefinement}`;

    return (
      <div className={rootClassNames}>
        <form className={cssClasses.form} onSubmit={this.onSubmit}>
          <label className={cssClasses.label}>
            <input
              className={`${cssClasses.input} ${cssClasses.inputMin}`}
              type="number"
              min={min}
              max={max}
              step={step}
              value={minValue}
              onChange={this.onChange('min')}
              placeholder={min}
              disabled={isDisabled}
            />
          </label>

          <span className={cssClasses.separator}>{labels.separator}</span>

          <label className={cssClasses.label}>
            <input
              className={`${cssClasses.input} ${cssClasses.inputMax}`}
              type="number"
              min={min}
              max={max}
              step={step}
              value={maxValue}
              onChange={this.onChange('max')}
              placeholder={max}
              disabled={isDisabled}
            />
          </label>

          <button
            type="submit"
            className={cssClasses.button}
            disabled={isDisabled}
          >
            {labels.submit}
          </button>
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
    button: PropTypes.string.isRequired,
  }).isRequired,
  labels: PropTypes.shape({
    separator: PropTypes.string.isRequired,
    submit: PropTypes.string.isRequired,
  }).isRequired,
  refine: PropTypes.func.isRequired,
};

export default RangeInput;
