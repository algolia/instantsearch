import React, {PropTypes, Component} from 'react';
import Slider from 'rc-slider';

// @TODO: rc-slider doesn't support our customization options relative to
// theming. We'll need to implement our own slider down the road.
export default class Range extends Component {
  static propTypes = {
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    value: PropTypes.shape({
      min: PropTypes.number,
      max: PropTypes.number,
    }).isRequired,
    refine: PropTypes.func.isRequired,
  };

  constructor() {
    super();

    // rc-slider calls its `onChange` prop when the provided value is outside
    // its bounds. We don't care for the corrected value.
    this.ignoreNextOnChange = false;

    this.state = {
      controlled: false,
      value: null,
    };
  }

  componentWillReceiveProps() {
    this.ignoreNextOnChange = true;
  }

  componentDidUpdate() {
    this.ignoreNextOnChange = false;
  }

  onChange = value => {
    if (this.ignoreNextOnChange) {
      this.ignoreNextOnChange = false;
      return;
    }
    this.setState({
      controlled: true,
      value: {min: value[0], max: value[1]},
    });
  };

  onAfterChange = value => {
    this.props.refine({min: value[0], max: value[1]});
    this.setState({
      controlled: false,
      value: null,
    });
  };

  render() {
    const value = this.state.controlled ? this.state.value : this.props.value;
    return (
      <Slider
        min={this.props.min}
        max={this.props.max}
        range
        value={[
          Math.max(this.props.min, value.min),
          Math.min(this.props.max, value.max),
        ]}
        onChange={this.onChange}
        onAfterChange={this.onAfterChange}
      />
    );
  }
}
