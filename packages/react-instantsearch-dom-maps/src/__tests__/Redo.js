import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { shallow } from 'enzyme';
import React from 'react';

import { createFakeMapInstance } from '../../test/mockGoogleMaps';
import { Redo } from '../Redo';

Enzyme.configure({ adapter: new Adapter() });

describe('Redo', () => {
  const defaultProps = {
    googleMapsInstance: createFakeMapInstance(),
    translate: (x) => x,

    hasMapMoveSinceLastRefine: false,
    refineWithInstance: () => {},
  };

  it('expect to render correctly', () => {
    const props = {
      ...defaultProps,
    };

    const wrapper = shallow(<Redo {...props} />);

    expect(wrapper.find('button').prop('disabled')).toBe(true);
    expect(wrapper).toMatchSnapshot();
  });

  it('expect to render correctly when map has moved', () => {
    const props = {
      ...defaultProps,
      hasMapMoveSinceLastRefine: true,
    };

    const wrapper = shallow(<Redo {...props} />);

    expect(wrapper.find('button').prop('disabled')).toBe(false);
    expect(wrapper).toMatchSnapshot();
  });

  it('expect to call refineWithInstance on button click', () => {
    const mapInstance = createFakeMapInstance();

    const props = {
      ...defaultProps,
      googleMapsInstance: mapInstance,
      refineWithInstance: jest.fn(),
    };

    const wrapper = shallow(<Redo {...props} />);

    expect(props.refineWithInstance).toHaveBeenCalledTimes(0);

    wrapper.find('button').simulate('click');

    expect(props.refineWithInstance).toHaveBeenCalledTimes(1);
    expect(props.refineWithInstance).toHaveBeenCalledWith(mapInstance);
  });
});
