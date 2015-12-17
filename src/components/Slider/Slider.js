import React from 'react';

import Nouislider from 'react-nouislider';

let cssPrefix = 'ais-range-slider--';

class Slider extends React.Component {

  // we are only interested in rawValues
  handleChange(formattedValues, handleId, rawValues) {
    this.props.onChange(rawValues);
  }

  render() {
    // setup pips
    let pips;
    if (this.props.pips === false) {
      pips = undefined;
    } else if (this.props.pips === true || typeof this.props.pips === 'undefined') {
      pips = {
        mode: 'positions',
        density: 3,
        values: [0, 50, 100],
        stepped: true,
        format: {
          to: (v) => { return Number(v).toLocaleString(); }
        }
      };
    } else {
      pips = this.props.pips;
    }
    return (
      <Nouislider
        {...this.props}
        animate={false}
        behaviour={'snap'}
        connect
        cssPrefix={cssPrefix}
        onChange={this.handleChange.bind(this)}
        pips={pips}
      />
    );
  }
}

Slider.propTypes = {
  onChange: React.PropTypes.func,
  onSlide: React.PropTypes.func,
  pips: React.PropTypes.oneOfType([
    React.PropTypes.bool,
    React.PropTypes.object
  ]),
  range: React.PropTypes.object.isRequired,
  start: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
  tooltips: React.PropTypes.oneOfType([
    React.PropTypes.bool,
    React.PropTypes.object
  ])
};

export default Slider;
