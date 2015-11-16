let React = require('react');
let {nextId} = require('../lib/utils.js');

class Selector extends React.Component {
  handleChange(event) {
    this.props.setValue(event.target.value);
  }

  render() {
    let {currentValue, options} = this.props;

    let handleChange = this.handleChange.bind(this);
    const id = nextId('selector');
    let select = (
      <select
        className={this.props.cssClasses.root}
        defaultValue={currentValue}
        id={id}
        onChange={handleChange}
      >
        {options.map((option) => {
          return <option className={this.props.cssClasses.item} key={option.value} value={option.value}>{option.label}</option>;
        })}
      </select>
    );
    return this.props.label ? (
      <span>
        <label className={this.props.cssClasses.label} htmlFor={id}>{this.props.label}</label>
        {select}
      </span>
    ) : select;
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
    ]),
    label: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.arrayOf(React.PropTypes.string)
    ])
  }),
  currentValue: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number
  ]).isRequired,
  label: React.PropTypes.string,
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

module.exports = Selector;
