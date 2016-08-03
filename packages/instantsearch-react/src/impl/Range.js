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

    this.state = {
      controlled: false,
      value: null,
    };
  }

  onChange = value => {
    this.setState({
      controlled: true,
      value: {min: value[0], max: value[1]},
    });
  };

  onAfterChange = () => {
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
        min={this.props.min}
        max={this.props.max}
        range
        value={[value.min, value.max]}
        onChange={this.onChange}
        onAfterChange={this.onAfterChange}
      />
    );
  }
}
