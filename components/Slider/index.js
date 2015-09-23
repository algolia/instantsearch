var React = require('react');

var Nouislider = require('react-nouislider');
var autoHide = require('../../decorators/autoHide');

require('style?prepend!raw!./index.css');

var cssPrefix = 'as-range-slider--';

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
        animate={false}
        behaviour={'snap'}
        connect
        cssPrefix={cssPrefix}
      />
    );
  }
}

Slider.propTypes = {
  onSlide: React.PropTypes.func,
  onChange: React.PropTypes.func,
  range: React.PropTypes.object.isRequired,
  start: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
  tooltips: React.PropTypes.oneOfType([
    React.PropTypes.bool,
    React.PropTypes.object
  ])
};

module.exports = autoHide(Slider);
