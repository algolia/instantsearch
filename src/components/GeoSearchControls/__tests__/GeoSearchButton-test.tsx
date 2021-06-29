/** @jsx h */

import { h } from 'preact';
import { shallow } from 'enzyme';
import GeoSearchButton from '../GeoSearchButton';
import { ReactElementLike } from 'prop-types';

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
      (
        <GeoSearchButton {...props}>
          Clear the current map refinement
        </GeoSearchButton>
      ) as ReactElementLike
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('expect to render disabled', () => {
    const props = {
      ...defaultProps,
      disabled: true,
    };

    const wrapper = shallow(
      (
        <GeoSearchButton {...props}>
          Clear the current map refinement
        </GeoSearchButton>
      ) as ReactElementLike
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('expect to call onClick when button is clicked', () => {
    const props = {
      ...defaultProps,
      onClick: jest.fn(),
    };

    const wrapper = shallow(
      (
        <GeoSearchButton {...props}>
          Clear the current map refinement
        </GeoSearchButton>
      ) as ReactElementLike
    );

    expect(props.onClick).not.toHaveBeenCalled();

    wrapper.find('button').simulate('click');

    expect(props.onClick).toHaveBeenCalled();
  });
});
