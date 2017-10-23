import React from 'react';
import { shallow } from 'enzyme';
import { createRenderer } from 'react-test-renderer/shallow';

import Slider, { RawSlider } from '../Slider';

describe('Slider', () => {
  it('expect to render correctly', () => {
    const tree = createRenderer().render(
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
    );
    expect(tree).toMatchSnapshot();
  });

  it('expect to render collapsed', () => {
    const tree = createRenderer().render(
      <Slider
        refine={() => undefined}
        min={0}
        max={500}
        values={[0, 0]}
        pips={true}
        step={2}
        tooltips={true}
        collapsible={{ collapsed: true }}
        shouldAutoHideContainer={false}
      />
    );
    expect(tree).toMatchSnapshot();
  });

  it('expect to render without pips', () => {
    const tree = createRenderer().render(
      <Slider
        refine={() => undefined}
        min={0}
        max={500}
        values={[0, 0]}
        pips={false}
        step={2}
        tooltips={true}
        shouldAutoHideContainer={false}
      />
    );
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

    shallow(<RawSlider {...props} />)
      .find('Rheostat')
      .simulate('change', {
        values: [0, 100],
      });

    expect(props.refine).toHaveBeenCalledWith([0, 100]);
  });
});
