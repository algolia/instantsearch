import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';

import Enhance, { Slider } from '../Slider';

describe('Slider', () => {
  it('expect to render correctly', () => {
    const tree = renderer
      .create(
        <Enhance
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

  it('expect to render without pips', () => {
    const tree = renderer
      .create(
        <Enhance
          refine={() => undefined}
          min={0}
          max={500}
          values={[0, 0]}
          pips={false}
          step={2}
          tooltips={true}
          shouldAutoHideContainer={false}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('expect to call handleChange on change', () => {
    const props = {
      refine: jest.fn(),
      min: 0,
      max: 500,
      values: [0, 0],
      pips: true,
      step: 2,
      tooltips: true,
      shouldAutoHideContainer: false,
    };

    shallow(<Slider {...props} />)
      .find('Rheostat')
      .simulate('change', {
        values: [0, 100],
      });

    expect(props.refine).toHaveBeenCalledWith([0, 100]);
  });
});
