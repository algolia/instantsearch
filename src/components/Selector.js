import React from 'react';

class Selector extends React.Component {
  componentWillMount() {
    this.handleChange = this.handleChange.bind(this);
  }

  shouldComponentUpdate() {
    return false;
  }

  handleChange(event) {
    this.props.setValue(event.target.value);
  }

  render() {
    let {currentValue, options} = this.props;

    return (
      <select
        className={this.props.cssClasses.root}
        defaultValue={currentValue}
        onChange={this.handleChange}
      >
        {options.map((option) => {
          return <option className={this.props.cssClasses.item} key={option.value} value={option.value}>{option.label}</option>;
        })}
      </select>
    );
  }
}

Selector.propTypes = {
  cssClasses: React.PropTypes.shape({
    root: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.arrayOf(React.PropTypes.string)
    ]),
    item: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.arrayOf(React.PropTypes.string)
    ])
  }),
  currentValue: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number
  ]).isRequired,
  options: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      value: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.number
      ]).isRequired,
      label: React.PropTypes.string.isRequired
    })
  ).isRequired,
  setValue: React.PropTypes.func.isRequired
};

export default Selector;
