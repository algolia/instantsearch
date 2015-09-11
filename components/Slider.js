var React = require('react');

var Nouislider = require('react-nouislider');

class Slider extends React.Component {

  // we are only interested in rawValues
  handleChange(formattedValues, handleId, rawValues) {
    this.props.onChange(rawValues);
  }

  render() {
    return (
      <Nouislider
        {...this.props}
        onChange={this.handleChange.bind(this)}
      />
    );
  }
}

Slider.propTypes = {
  onSlide: React.PropTypes.func,
  onChange: React.PropTypes.func,
  range: React.PropTypes.object.isRequired,
  start: React.PropTypes.arrayOf(React.PropTypes.number).isRequired
};

module.exports = Slider;
