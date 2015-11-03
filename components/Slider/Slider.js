let React = require('react');

let Nouislider = require('react-nouislider');

let cssPrefix = 'ais-range-slider--';

class Slider extends React.Component {

  // we are only interested in rawValues
  handleChange(formattedValues, handleId, rawValues) {
    this.props.onChange(rawValues);
  }

  render() {
    return (
      <Nouislider
        {...this.props}
        animate={false}
        behaviour={'snap'}
        connect
        cssPrefix={cssPrefix}
        onChange={this.handleChange.bind(this)}
      />
    );
  }
}

Slider.propTypes = {
  onChange: React.PropTypes.func,
  onSlide: React.PropTypes.func,
  range: React.PropTypes.object.isRequired,
  start: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
  tooltips: React.PropTypes.oneOfType([
    React.PropTypes.bool,
    React.PropTypes.object
  ])
};

module.exports = Slider;
