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
    const {currentValue, options} = this.props;

    return (
      <select
        className={this.props.cssClasses.root}
        onChange={this.handleChange}
        value={currentValue}
      >
        {options.map(option =>
          <option
            className={this.props.cssClasses.item}
            key={option.value}
            value={option.value}>
              {option.label}
          </option>
        )}
      </select>
    );
  }
}

RawSelector.propTypes = {
  cssClasses: React.PropTypes.shape({
    root: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.arrayOf(React.PropTypes.string),
    ]),
    item: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.arrayOf(React.PropTypes.string),
    ]),
  }),
  currentValue: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number,
  ]).isRequired,
  options: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      value: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.number,
      ]).isRequired,
      label: React.PropTypes.string.isRequired,
    })
  ).isRequired,
  setValue: React.PropTypes.func.isRequired,
};

export default autoHideContainer(headerFooter(RawSelector));
