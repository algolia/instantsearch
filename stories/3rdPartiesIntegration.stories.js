import React, {PropTypes} from 'react';
import {storiesOf} from '@kadira/storybook';
import {connectRange} from '../packages/react-instantsearch/connectors';
import {WrapWithHits} from './util';
import Rheostat from 'rheostat';

const stories = storiesOf('Integration With Other Libraries', module);

stories.add('Airbnb Rheostat', () =>
  <WrapWithHits >
    <AirbnbRheostatConnected attributeName="price"/>
  </WrapWithHits>
);

class AirbnbRheostat extends React.Component {

  static propTypes = {
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    value: PropTypes.shape({
      min: PropTypes.number,
      max: PropTypes.number,
    }).isRequired,
    refine: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.updateValue = this.updateValue.bind(this);
  }

  updateValue(sliderState) {
    this.props.refine({min: sliderState.values[0], max: sliderState.values[1]});
  }

  render() {
    return (
      <div>
        <Rheostat
          min={this.props.min}
          max={this.props.max}
          values={[this.props.value.min, this.props.value.max]}
          onChange={this.updateValue}
        />
        <ol>
          <lh>Values</lh>
          <li> {this.props.value.min}
          </li>
          <li> {this.props.value.max}
          </li>
        </ol>
      </div>
    );
  }
}

const AirbnbRheostatConnected = connectRange(AirbnbRheostat);

export default AirbnbRheostatConnected;
