import PropTypes from 'prop-types';
import React, { Component } from 'preact-compat';

class Selector extends Component {
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
        className={this.props.cssClasses.select}
        onChange={this.handleChange}
        value={`${currentValue}`}
      >
        {options.map(option => (
          <option
            className={this.props.cssClasses.option}
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
    root: PropTypes.string.isRequired,
    select: PropTypes.string.isRequired,
    option: PropTypes.string.isRequired,
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
