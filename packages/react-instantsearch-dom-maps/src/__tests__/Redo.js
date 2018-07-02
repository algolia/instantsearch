import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { createFakeMapInstance } from '../../test/mockGoogleMaps';
import { STATE_CONTEXT } from '../Provider';
import { GOOGLE_MAPS_CONTEXT } from '../GoogleMaps';
import { Redo } from '../Redo';

Enzyme.configure({ adapter: new Adapter() });

describe('Redo', () => {
  const defaultProps = {
    translate: x => x,
  };

  const defaultContext = {
    [STATE_CONTEXT]: {
      hasMapMoveSinceLastRefine: false,
      refineWithInstance: () => {},
    },
    [GOOGLE_MAPS_CONTEXT]: {
      instance: createFakeMapInstance(),
    },
  };

  const getStateContext = context => context[STATE_CONTEXT];
  const getGoogleMapsContext = context => context[GOOGLE_MAPS_CONTEXT];

  it('expect to render correctly', () => {
    const props = {
      ...defaultProps,
    };

    const context = {
      ...defaultContext,
    };

    const wrapper = shallow(<Redo {...props} />, {
      context,
    });

    expect(wrapper.find('button').prop('disabled')).toBe(true);
    expect(wrapper).toMatchSnapshot();
  });

  it('expect to render correctly when map has moved', () => {
    const props = {
      ...defaultProps,
    };

    const context = {
      ...defaultContext,
      [STATE_CONTEXT]: {
        ...getStateContext(defaultContext),
        hasMapMoveSinceLastRefine: true,
      },
    };

    const wrapper = shallow(<Redo {...props} />, {
      context,
    });

    expect(wrapper.find('button').prop('disabled')).toBe(false);
    expect(wrapper).toMatchSnapshot();
  });

  it('expect to call refineWithInstance on button click', () => {
    const instance = createFakeMapInstance();

    const props = {
      ...defaultProps,
    };

    const context = {
      ...defaultContext,
      [STATE_CONTEXT]: {
        ...getStateContext(defaultContext),
        refineWithInstance: jest.fn(),
      },
      [GOOGLE_MAPS_CONTEXT]: {
        ...getGoogleMapsContext(defaultContext),
        instance,
      },
    };

    const wrapper = shallow(<Redo {...props} />, {
      context,
    });

    const { refineWithInstance } = getStateContext(context);

    expect(refineWithInstance).toHaveBeenCalledTimes(0);

    wrapper.find('button').simulate('click');

    expect(refineWithInstance).toHaveBeenCalledTimes(1);
    expect(refineWithInstance).toHaveBeenCalledWith(instance);
  });
});
