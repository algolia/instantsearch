/** @jsx h */

import { h } from 'preact';
import { act } from 'preact/test-utils';
import { shallow, mount } from 'enzyme';
import {
  fireEvent,
  render,
  getByPlaceholderText,
} from 'preact-testing-library';
import Slider from '../Slider';

describe('Slider', () => {
  it('expect to render correctly', () => {
    const tree = shallow(
      <Slider
        refine={() => undefined}
        min={0}
        max={500}
        values={[0, 0]}
        pips={true}
        step={2}
        tooltips={true}
        cssClasses={{
          root: 'root',
          disabledRoot: 'disabledRoot',
        }}
      />
    );

    expect(tree).toMatchSnapshot();
  });

  it('expect to render without pips', () => {
    const tree = shallow(
      <Slider
        refine={() => undefined}
        min={0}
        max={500}
        values={[0, 0]}
        pips={false}
        step={2}
        tooltips={true}
        cssClasses={{
          root: 'root',
          disabledRoot: 'disabledRoot',
        }}
      />
    );

    expect(tree).toMatchSnapshot();
  });

  it('expect to render with CSS classes', () => {
    const tree = shallow(
      <Slider
        refine={() => undefined}
        min={0}
        max={500}
        values={[0, 0]}
        pips={false}
        step={2}
        tooltips={true}
        cssClasses={{
          root: 'root',
          disabledRoot: 'disabledRoot',
        }}
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
      cssClasses: {
        root: 'root',
        disabledRoot: 'disabledRoot',
      },
    };

    // act(() => {
    shallow(<Slider {...props} />)
      .find('Rheostat')
      .simulate('change', {
        values: [0, 100],
      });
    // });

    // const { container } = render(<Slider {...props} />);

    // fireEvent.input(getByPlaceholderText(container, 'Search'), {
    //   target: { value: 'hello' },
    // });

    expect(props.refine).toHaveBeenCalledWith([0, 100]);
  });
});
