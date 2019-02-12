import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { createFakeMapInstance } from '../../test/mockGoogleMaps';
import { STATE_CONTEXT } from '../Provider';
import { Redo } from '../Redo';

Enzyme.configure({ adapter: new Adapter() });

describe('Redo', () => {
  const defaultProps = {
    googleMapsInstance: createFakeMapInstance(),
    translate: x => x,
  };

  const defaultContext = {
    [STATE_CONTEXT]: {
      hasMapMoveSinceLastRefine: false,
      refineWithInstance: () => {},
    },
  };

  const getStateContext = context => context[STATE_CONTEXT];

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
    const mapInstance = createFakeMapInstance();

    const props = {
      ...defaultProps,
      googleMapsInstance: mapInstance,
    };

    const context = {
      ...defaultContext,
      [STATE_CONTEXT]: {
        ...getStateContext(defaultContext),
        refineWithInstance: jest.fn(),
      },
    };

    const wrapper = shallow(<Redo {...props} />, {
      context,
    });

    const { refineWithInstance } = getStateContext(context);

    expect(refineWithInstance).toHaveBeenCalledTimes(0);

    wrapper.find('button').simulate('click');

    expect(refineWithInstance).toHaveBeenCalledTimes(1);
    expect(refineWithInstance).toHaveBeenCalledWith(mapInstance);
  });
});
