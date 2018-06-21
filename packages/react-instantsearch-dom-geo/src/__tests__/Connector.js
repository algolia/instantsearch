import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Connector } from '../Connector';

Enzyme.configure({ adapter: new Adapter() });

describe('Connector', () => {
  const defaultProps = {
    hits: [],
    position: null,
    currentRefinement: null,
    isRefinedWithMap: false,
    refine: () => {},
  };

  const lastRenderArgs = fn => fn.mock.calls[fn.mock.calls.length - 1][0];

  it('expect to call children with props', () => {
    const children = jest.fn(x => x);

    const props = {
      ...defaultProps,
    };

    shallow(<Connector {...props}>{children}</Connector>);

    expect(children).toHaveBeenCalledTimes(1);
    expect(children).toHaveBeenCalledWith({
      hits: [],
      position: null,
      currentRefinement: null,
      isRefinedWithMap: false,
      isRefineOnMapMove: true,
      toggleRefineOnMapMove: expect.any(Function),
      hasMapMoveSinceLastRefine: false,
      setMapMoveSinceLastRefine: expect.any(Function),
      refine: expect.any(Function),
    });
  });

  describe('setMapMoveSinceLastRefine', () => {
    it('expect to update the state with the given value', () => {
      const children = jest.fn(x => x);

      const props = {
        ...defaultProps,
      };

      const wrapper = shallow(<Connector {...props}>{children}</Connector>);

      lastRenderArgs(children).setMapMoveSinceLastRefine(true);

      expect(wrapper.state().hasMapMoveSinceLastRefine).toBe(true);
    });

    it('expect to only update the state when the given is different', () => {
      const children = jest.fn(x => x);

      const props = {
        ...defaultProps,
      };

      shallow(<Connector {...props}>{children}</Connector>);

      expect(children).toHaveBeenCalledTimes(1);
      expect(children).toHaveBeenLastCalledWith(
        expect.objectContaining({
          hasMapMoveSinceLastRefine: false,
        })
      );

      lastRenderArgs(children).setMapMoveSinceLastRefine(true);

      expect(children).toHaveBeenCalledTimes(2);
      expect(children).toHaveBeenLastCalledWith(
        expect.objectContaining({
          hasMapMoveSinceLastRefine: true,
        })
      );

      lastRenderArgs(children).setMapMoveSinceLastRefine(true);

      expect(children).toHaveBeenCalledTimes(2);
      expect(children).toHaveBeenLastCalledWith(
        expect.objectContaining({
          hasMapMoveSinceLastRefine: true,
        })
      );
    });
  });

  describe('toggleRefineOnMapMove', () => {
    it('expect to update the state with the invert of previous value (true)', () => {
      const children = jest.fn(x => x);

      const props = {
        ...defaultProps,
      };

      const wrapper = shallow(<Connector {...props}>{children}</Connector>);

      expect(wrapper.state().isRefineOnMapMove).toBe(true);

      lastRenderArgs(children).toggleRefineOnMapMove();

      expect(wrapper.state().isRefineOnMapMove).toBe(false);
    });

    it('expect to update the state with the invert of previous value (false)', () => {
      const children = jest.fn();

      const props = {
        ...defaultProps,
      };

      const wrapper = shallow(<Connector {...props}>{children}</Connector>);

      wrapper.setState({
        isRefineOnMapMove: false,
      });

      expect(wrapper.state().isRefineOnMapMove).toBe(false);

      lastRenderArgs(children).toggleRefineOnMapMove();

      expect(wrapper.state().isRefineOnMapMove).toBe(true);
    });
  });
});
