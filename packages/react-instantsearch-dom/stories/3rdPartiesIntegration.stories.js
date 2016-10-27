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

const ConnectedRange = connectRange(({min, max, value, refine}) => {
  const updateValue = sliderState => {
    if (sliderState.values[0] !== min || sliderState.values[1] !== max) {
      refine({min: sliderState.values[0], max: sliderState.values[1]});
    }
  };

  return (
    <div>
      <Rheostat
        min={min}
        max={max}
        values={[value.min, value.max]}
        onChange={updateValue}
      />
    </div>
  );
});

export default ConnectedRange;
