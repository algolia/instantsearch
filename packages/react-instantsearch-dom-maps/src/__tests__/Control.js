import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { shallow } from 'enzyme';
import React from 'react';

import { createFakeMapInstance } from '../../test/mockGoogleMaps';
import { Control } from '../Control';

Enzyme.configure({ adapter: new Adapter() });

describe('Control', () => {
  const defaultProps = {
    googleMapsInstance: createFakeMapInstance(),
    translate: (x) => x,
    isRefineOnMapMove: true,
    hasMapMoveSinceLastRefine: false,
    toggleRefineOnMapMove: () => {},
    refineWithInstance: () => {},
  };

  it('expect to render correctly with refine on map move', () => {
    const props = {
      ...defaultProps,
    };

    const wrapper = shallow(<Control {...props} />);

    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('input').props().checked).toBe(true);
  });

  it('expect to render correctly without refine on map move', () => {
    const props = {
      ...defaultProps,
      isRefineOnMapMove: false,
    };

    const wrapper = shallow(<Control {...props} />);

    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('input').props().checked).toBe(false);
  });

  it('expect to render correctly without refine on map move when the map has moved', () => {
    const props = {
      ...defaultProps,
      isRefineOnMapMove: false,
      hasMapMoveSinceLastRefine: true,
    };

    const wrapper = shallow(<Control {...props} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('expect to call toggleRefineOnMapMove on input change', () => {
    const props = {
      ...defaultProps,
      toggleRefineOnMapMove: jest.fn(),
    };

    const wrapper = shallow(<Control {...props} />);

    expect(props.toggleRefineOnMapMove).toHaveBeenCalledTimes(0);

    wrapper.find('input').simulate('change');

    expect(props.toggleRefineOnMapMove).toHaveBeenCalledTimes(1);
  });

  it('expect to call refineWithInstance on button click', () => {
    const mapInstance = createFakeMapInstance();

    const props = {
      ...defaultProps,
      googleMapsInstance: mapInstance,
      isRefineOnMapMove: false,
      hasMapMoveSinceLastRefine: true,
      refineWithInstance: jest.fn(),
    };

    const wrapper = shallow(<Control {...props} />);

    expect(props.refineWithInstance).toHaveBeenCalledTimes(0);

    wrapper.find('button').simulate('click');

    expect(props.refineWithInstance).toHaveBeenCalledTimes(1);
    expect(props.refineWithInstance).toHaveBeenCalledWith(mapInstance);
  });
});
