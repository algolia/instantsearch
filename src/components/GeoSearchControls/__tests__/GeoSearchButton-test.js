import React from 'preact-compat';
import { shallow } from 'enzyme';
import serializer from 'enzyme-to-json/serializer';
import GeoSearchButton from '../GeoSearchButton';

expect.addSnapshotSerializer(serializer);

describe('GeoSearchButton', () => {
  const defaultProps = {
    className: 'button',
    onClick: () => {},
  };

  it('expect to render', () => {
    const props = {
      ...defaultProps,
    };

    const wrapper = shallow(
      <GeoSearchButton {...props}>
        Clear the current map refinement
      </GeoSearchButton>
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('expect to render disabled', () => {
    const props = {
      ...defaultProps,
      disabled: true,
    };

    const wrapper = shallow(
      <GeoSearchButton {...props}>
        Clear the current map refinement
      </GeoSearchButton>
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('expect to call onClick when button is clicked', () => {
    const props = {
      ...defaultProps,
      onClick: jest.fn(),
    };

    const wrapper = shallow(
      <GeoSearchButton {...props}>
        Clear the current map refinement
      </GeoSearchButton>
    );

    expect(props.onClick).not.toHaveBeenCalled();

    wrapper.find('button').simulate('click');

    expect(props.onClick).toHaveBeenCalled();
  });
});
