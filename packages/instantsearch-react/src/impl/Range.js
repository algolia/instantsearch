import React, {PropTypes, Component} from 'react';
import Slider from 'rc-slider';

// @TODO: rc-slider doesn't support our customization options relative to
// theming. We'll need to implement our own slider down the road.
export default class Range extends Component {
  static propTypes = {
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    value: PropTypes.arrayOf(PropTypes.number).isRequired,
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
      value,
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
    return (
      <Slider
        min={this.props.min}
        max={this.props.max}
        range
        value={this.state.controlled ? this.state.value : this.props.value}
        onChange={this.onChange}
        onAfterChange={this.onAfterChange}
      />
    );
  }
}
