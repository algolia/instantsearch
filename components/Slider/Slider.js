var React = require('react');

var Nouislider = require('react-nouislider');

var cssPrefix = 'ais-range-slider--';

class Slider extends React.Component {

  // we are only interested in rawValues
  handleChange(formattedValues, handleId, rawValues) {
    this.props.onChange(rawValues);
  }

  render() {
    return (
      <div>
        <Nouislider
          {...this.props}
          animate={false}
          behaviour={'snap'}
          connect
          cssPrefix={cssPrefix}
          onChange={this.handleChange.bind(this)}
        />
      </div>
    );
  }
}

Slider.propTypes = {
  cssClasses: React.PropTypes.shape({
    body: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.arrayOf(React.PropTypes.string)
    ])
  }),
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
