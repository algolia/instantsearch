var cx = require('classnames');
var React = require('react');

var Nouislider = require('react-nouislider');
var autoHide = require('../../decorators/autoHide');
var headerFooter = require('../../decorators/headerFooter');

require('style?prepend!raw!./index.css');

var cssPrefix = 'as-range-slider--';

class Slider extends React.Component {

  // we are only interested in rawValues
  handleChange(formattedValues, handleId, rawValues) {
    this.props.onChange(rawValues);
  }

  render() {
    return (
      <div className={cx(this.props.cssClasses.body)}>
        <Nouislider
          {...this.props}
          onChange={this.handleChange.bind(this)}
          animate={false}
          behaviour={'snap'}
          connect
          cssPrefix={cssPrefix}
        />
      </div>
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
  ]),
  cssClasses: React.PropTypes.shape({
    body: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.arrayOf(React.PropTypes.string)
    ])
  })
};

module.exports = autoHide(headerFooter(Slider));
