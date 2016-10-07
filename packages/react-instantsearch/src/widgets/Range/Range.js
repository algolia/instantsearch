import React, {PropTypes, Component} from 'react';

import themeable from '../../core/themeable';
import translatable from '../../core/translatable';

import Slider from '../../components/Slider';

import theme from './Range.css';

class Range extends Component {
  static propTypes = {
    translate: PropTypes.func.isRequired,
    applyTheme: PropTypes.func.isRequired,
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,

    /**
     * Every handle move will jump that number of steps.
     * @public
     */
    step: PropTypes.number,

    value: PropTypes.shape({
      min: PropTypes.number,
      max: PropTypes.number,
    }).isRequired,
    refine: PropTypes.func.isRequired,
  };

  static defaultProps = {
    step: 1,
  };

  constructor() {
    super();
    this.state = {
      controlled: false,
      value: null,
    };
  }

  processValue = v => {
    const {min, max, step} = this.props;
    if (v === min || v === max) {
      return v;
    }
    return Math.round(v * step) / step;
  };

  onChange = value => {
    value = value.map(this.processValue);
    this.setState({
      controlled: true,
      value: {min: value[0], max: value[1]},
    });
  };

  onEnd = () => {
    this.props.refine(this.state.value);
    this.setState({
      controlled: false,
      value: null,
    });
  };

  render() {
    const value = this.state.controlled ? this.state.value : this.props.value;
    return (
      <Slider
        applyTheme={this.props.applyTheme}
        translate={this.props.translate}
        min={this.props.min}
        max={this.props.max}
        value={[
          Math.max(this.props.min, value.min),
          Math.min(this.props.max, value.max),
        ]}
        onChange={this.onChange}
        onEnd={this.onEnd}
      />
    );
  }
}

export default themeable(theme)(
  translatable({
    value: v => v.toLocaleString(),
  })(
    Range
  )
);
