import PropTypes from 'prop-types';
import React from 'react';

import autoHideContainer from '../decorators/autoHideContainer.js';
import headerFooter from '../decorators/headerFooter.js';

export class RawSelector extends React.Component {
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
        className={this.props.cssClasses.root}
        onChange={this.handleChange}
        value={currentValue}
      >
        {options.map(option =>
          <option
            className={this.props.cssClasses.item}
            key={option.label + option.value}
            value={option.value}
          >
            {option.label}
          </option>
        )}
      </select>
    );
  }
}

RawSelector.propTypes = {
  cssClasses: PropTypes.shape({
    root: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    item: PropTypes.oneOfType([
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

export default autoHideContainer(headerFooter(RawSelector));
