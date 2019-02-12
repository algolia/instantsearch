import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { createFakeMapInstance } from '../../test/mockGoogleMaps';
import { STATE_CONTEXT } from '../Provider';
import { Control } from '../Control';

Enzyme.configure({ adapter: new Adapter() });

describe('Control', () => {
  const defaultProps = {
    googleMapsInstance: createFakeMapInstance(),
    translate: x => x,
  };

  const defaultContext = {
    [STATE_CONTEXT]: {
      isRefineOnMapMove: true,
      hasMapMoveSinceLastRefine: false,
      toggleRefineOnMapMove: () => {},
      refineWithInstance: () => {},
    },
  };

  const getStateContext = context => context[STATE_CONTEXT];

  it('expect to render correctly with refine on map move', () => {
    const props = {
      ...defaultProps,
    };

    const context = {
      ...defaultContext,
    };

    const wrapper = shallow(<Control {...props} />, {
      context,
    });

    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('input').props().checked).toBe(true);
  });

  it('expect to render correctly without refine on map move', () => {
    const props = {
      ...defaultProps,
    };

    const context = {
      ...defaultContext,
      [STATE_CONTEXT]: {
        ...getStateContext(defaultContext),
        isRefineOnMapMove: false,
      },
    };

    const wrapper = shallow(<Control {...props} />, {
      context,
    });

    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('input').props().checked).toBe(false);
  });

  it('expect to render correctly without refine on map move when the map has moved', () => {
    const props = {
      ...defaultProps,
    };

    const context = {
      ...defaultContext,
      [STATE_CONTEXT]: {
        ...getStateContext(defaultContext),
        isRefineOnMapMove: false,
        hasMapMoveSinceLastRefine: true,
      },
    };

    const wrapper = shallow(<Control {...props} />, {
      context,
    });

    expect(wrapper).toMatchSnapshot();
  });

  it('expect to call toggleRefineOnMapMove on input change', () => {
    const props = {
      ...defaultProps,
    };

    const context = {
      ...defaultContext,
      [STATE_CONTEXT]: {
        ...getStateContext(defaultContext),
        toggleRefineOnMapMove: jest.fn(),
      },
    };

    const wrapper = shallow(<Control {...props} />, {
      context,
    });

    expect(
      getStateContext(context).toggleRefineOnMapMove
    ).toHaveBeenCalledTimes(0);

    wrapper.find('input').simulate('change');

    expect(
      getStateContext(context).toggleRefineOnMapMove
    ).toHaveBeenCalledTimes(1);
  });

  it('expect to call refineWithInstance on button click', () => {
    const mapInstance = createFakeMapInstance();

    const props = {
      ...defaultProps,
      googleMapsInstance: mapInstance,
    };

    const context = {
      ...defaultContext,
      [STATE_CONTEXT]: {
        ...getStateContext(defaultContext),
        isRefineOnMapMove: false,
        hasMapMoveSinceLastRefine: true,
        refineWithInstance: jest.fn(),
      },
    };

    const wrapper = shallow(<Control {...props} />, {
      context,
    });

    const { refineWithInstance } = getStateContext(context);

    expect(refineWithInstance).toHaveBeenCalledTimes(0);

    wrapper.find('button').simulate('click');

    expect(refineWithInstance).toHaveBeenCalledTimes(1);
    expect(refineWithInstance).toHaveBeenCalledWith(mapInstance);
  });
});
