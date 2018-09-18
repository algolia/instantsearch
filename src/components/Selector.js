import PropTypes from 'prop-types';
import React, { Component } from 'preact-compat';
import cx from 'classnames';

export class Selector extends Component {
  componentWillMount() {
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.props.setValue(event.target.value);
  }

  render() {
    const { currentValue, options } = this.props;

    return (
      <select
        className={cx(this.props.cssClasses.select)}
        onChange={this.handleChange}
        value={`${currentValue}`}
      >
        {options.map(option => (
          <option
            className={cx(this.props.cssClasses.option)}
            key={option.label + option.value}
            value={`${option.value}`}
          >
            {option.label}
          </option>
        ))}
      </select>
    );
  }
}

Selector.propTypes = {
  cssClasses: PropTypes.shape({
    root: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    select: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    option: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
  }),
  currentValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  setValue: PropTypes.func.isRequired,
};

export default Selector;
