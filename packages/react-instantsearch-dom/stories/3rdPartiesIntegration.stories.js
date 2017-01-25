import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {connectRange} from '../packages/react-instantsearch/connectors';
import {WrapWithHits} from './util';
import Rheostat from 'rheostat';

const stories = storiesOf('Integration With Other Libraries', module);

stories.add('Airbnb Rheostat', () =>
  <WrapWithHits >
    <ConnectedRange attributeName="price"/>
  </WrapWithHits>
);

const Range = React.createClass({
  propTypes: {
    min: React.PropTypes.number,
    max: React.PropTypes.number,
    currentRefinement: React.PropTypes.object,
    refine: React.PropTypes.func.isRequired,
    canRefine: React.PropTypes.bool.isRequired,
  },

  getInitialState() {
    return {currentValues: {min: this.props.min, max: this.props.max}};
  },

  componentWillReceiveProps(sliderState) {
    if (sliderState.canRefine) {
      this.setState({currentValues: {min: sliderState.currentRefinement.min, max: sliderState.currentRefinement.max}});
    }
  },

  onValuesUpdated(sliderState) {
    this.setState({currentValues: {min: sliderState.values[0], max: sliderState.values[1]}});
  },

  onChange(sliderState) {
    if (this.props.currentRefinement.min !== sliderState.values[0] ||
      this.props.currentRefinement.max !== sliderState.values[1]) {
      this.props.refine({min: sliderState.values[0], max: sliderState.values[1]});
    }
  },

  render() {
    const {min, max, currentRefinement} = this.props;
    const {currentValues} = this.state;
    return min !== max ?
      <div>
        <Rheostat
          min={min}
          max={max}
          values={[currentRefinement.min, currentRefinement.max]}
          onChange={this.onChange}
          onValuesUpdated={this.onValuesUpdated}
        />
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <div>{currentValues.min}</div>
          <div>{currentValues.max}</div>
        </div>
      </div> : null;
  },
});

Range.propTypes = {
  min: React.PropTypes.number,
  max: React.PropTypes.number,
  currentRefinement: React.PropTypes.object,
  refine: React.PropTypes.func.isRequired,
};

const ConnectedRange = connectRange(Range);

export default ConnectedRange;
