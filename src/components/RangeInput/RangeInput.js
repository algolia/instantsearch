import React, { Component } from 'preact-compat';
import PropTypes from 'prop-types';
import autoHideContainerHOC from '../../decorators/autoHideContainer.js';
import headerFooterHOC from '../../decorators/headerFooter.js';

export class RawRangeInput extends Component {
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

    return (
      <form className={cssClasses.form} onSubmit={this.onSubmit}>
        <fieldset className={cssClasses.fieldset}>
          <label className={cssClasses.labelMin}>
            <input
              className={cssClasses.inputMin}
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
          <label className={cssClasses.labelMax}>
            <input
              className={cssClasses.inputMax}
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
            role="button"
            className={cssClasses.submit}
            disabled={isDisabled}
          >
            {labels.submit}
          </button>
        </fieldset>
      </form>
    );
  }
}

RawRangeInput.propTypes = {
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
    currency: PropTypes.string.isRequired,
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

export default autoHideContainerHOC(headerFooterHOC(RawRangeInput));
