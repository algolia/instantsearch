/** @jsx h */

import { h } from 'preact';
import { shallow } from 'enzyme';
import GeoSearchToggle from '../GeoSearchToggle';

describe('GeoSearchToggle', () => {
  const defaultProps = {
    classNameLabel: 'label',
    classNameInput: 'input',
    checked: false,
    onToggle: () => {},
  };

  it('expect to render', () => {
    const props = {
      ...defaultProps,
    };

    const wrapper = shallow(
      <GeoSearchToggle {...props}>
        Clear the current map refinement
      </GeoSearchToggle>
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('expect to render checked', () => {
    const props = {
      ...defaultProps,
      checked: true,
    };

    const wrapper = shallow(
      <GeoSearchToggle {...props}>
        Clear the current map refinement
      </GeoSearchToggle>
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('expect to call onToggle when the input changed', () => {
    const props = {
      ...defaultProps,
      onToggle: jest.fn(),
    };

    const wrapper = shallow(
      <GeoSearchToggle {...props}>
        Clear the current map refinement
      </GeoSearchToggle>
    );

    expect(props.onToggle).not.toHaveBeenCalled();

    wrapper.find('input').simulate('change');

    expect(props.onToggle).toHaveBeenCalled();
  });
});
