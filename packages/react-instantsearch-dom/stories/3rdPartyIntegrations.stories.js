import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { storiesOf } from '@storybook/react';
import { connectRange } from '../packages/react-instantsearch/connectors';
import { WrapWithHits } from './util';
import Rheostat from 'rheostat';

const stories = storiesOf('Integration With Other Libraries', module);

stories.add('Airbnb Rheostat', () => (
  <WrapWithHits linkedStoryGroup="3rdPartyIntegrations">
    <ConnectedRange attributeName="price" />
  </WrapWithHits>
));

class Range extends Component {
  static propTypes = {
    min: PropTypes.number,
    max: PropTypes.number,
    currentRefinement: PropTypes.object,
    refine: PropTypes.func.isRequired,
    canRefine: PropTypes.bool.isRequired,
  };

  state = { currentValues: { min: this.props.min, max: this.props.max } };

  componentWillReceiveProps(sliderState) {
    if (sliderState.canRefine) {
      this.setState({
        currentValues: {
          min: sliderState.currentRefinement.min,
          max: sliderState.currentRefinement.max,
        },
      });
    }
  }

  onValuesUpdated = sliderState => {
    this.setState({
      currentValues: { min: sliderState.values[0], max: sliderState.values[1] },
    });
  };

  onChange = sliderState => {
    if (
      this.props.currentRefinement.min !== sliderState.values[0] ||
      this.props.currentRefinement.max !== sliderState.values[1]
    ) {
      this.props.refine({
        min: sliderState.values[0],
        max: sliderState.values[1],
      });
    }
  };

  render() {
    const { min, max, currentRefinement } = this.props;
    const { currentValues } = this.state;
    return min !== max
      ? <div>
          <Rheostat
            min={min}
            max={max}
            values={[currentRefinement.min, currentRefinement.max]}
            onChange={this.onChange}
            onValuesUpdated={this.onValuesUpdated}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>{currentValues.min}</div>
            <div>{currentValues.max}</div>
          </div>
        </div>
      : null;
  }
}

const ConnectedRange = connectRange(Range);

export default ConnectedRange;
