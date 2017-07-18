import React from 'react';
import renderer from 'react-test-renderer';

import Slider from '../Slider';

describe('Slider', () => {
  it('should render correctly', () => {
    const tree = renderer
      .create(
        <Slider
          refine={() => undefined}
          min={0}
          max={500}
          values={[0, 0]}
          pips={true}
          step={2}
          tooltips={true}
          shouldAutoHideContainer={false}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
