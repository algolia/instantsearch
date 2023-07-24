import { storiesOf } from '@storybook/react';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connectRange } from 'react-instantsearch-dom';
import Rheostat from 'rheostat';

import { WrapWithHits } from './util';

class Range extends Component {
  static propTypes = {
    min: PropTypes.number,
    max: PropTypes.number,
    currentRefinement: PropTypes.object,
    refine: PropTypes.func.isRequired,
    canRefine: PropTypes.bool.isRequired,
    header: PropTypes.node,
    footer: PropTypes.node,
  };

  state = { currentValues: { min: this.props.min, max: this.props.max } };

  componentDidUpdate(prevProps) {
    if (
      this.props.canRefine &&
      (prevProps.currentRefinement.min !== this.props.currentRefinement.min ||
        prevProps.currentRefinement.max !== this.props.currentRefinement.max)
    ) {
      this.setState({
        currentValues: {
          min: this.props.currentRefinement.min,
          max: this.props.currentRefinement.max,
        },
      });
    }
  }

  onValuesUpdated = (sliderState) => {
    this.setState({
      currentValues: { min: sliderState.values[0], max: sliderState.values[1] },
    });
  };

  onChange = (sliderState) => {
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

    return min !== max ? (
      <Rheostat
        className="ais-RangeSlider"
        min={min}
        max={max}
        values={[currentRefinement.min, currentRefinement.max]}
        onChange={this.onChange}
        onValuesUpdated={this.onValuesUpdated}
      >
        <div
          className="rheostat-marker rheostat-marker--large"
          style={{ left: '0%', position: 'absolute', marginLeft: '0px' }}
        >
          <div className="rheostat-value">{currentValues.min}</div>
        </div>
        <div
          className="rheostat-marker rheostat-marker--large"
          style={{ left: '100%', position: 'absolute', marginLeft: '-1px' }}
        >
          <div className="rheostat-value">{currentValues.max}</div>
        </div>
      </Rheostat>
    ) : null;
  }
}

const ConnectedRange = connectRange(Range);

export default ConnectedRange;

const stories = storiesOf('Integration With Other Libraries', module);

stories.add('Airbnb Rheostat', () => (
  <WrapWithHits linkedStoryGroup="3rdPartyIntegrations.stories.js">
    <h3 style={{ marginBottom: 50, textAlign: 'center' }}>
      ⚠️ This example only works with the version 2.x of Rheostat ️️⚠️
    </h3>
    <ConnectedRange attribute="price" />
  </WrapWithHits>
));
