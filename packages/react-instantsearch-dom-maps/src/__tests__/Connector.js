import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { shallow } from 'enzyme';
import React from 'react';

import { Connector } from '../Connector';

Enzyme.configure({ adapter: new Adapter() });

describe('Connector', () => {
  const defaultProps = {
    hits: [],
    position: null,
    currentRefinement: null,
    isRefinedWithMap: false,
    enableRefineOnMapMove: true,
    refine: () => {},
  };

  const lastRenderArgs = (fn) => fn.mock.calls[fn.mock.calls.length - 1][0];

  it('expect to call children with props', () => {
    const children = jest.fn((x) => x);

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

  it('expect to call children with refine on map move disabled', () => {
    const children = jest.fn((x) => x);

    const props = {
      ...defaultProps,
      enableRefineOnMapMove: false,
    };

    shallow(<Connector {...props}>{children}</Connector>);

    expect(children).toHaveBeenCalledTimes(1);
    expect(children).toHaveBeenCalledWith(
      expect.objectContaining({
        isRefineOnMapMove: false,
      })
    );
  });

  describe('getDerivedStateFromProps', () => {
    it('expect reset hasMapMoveSinceLastRefine when position change', () => {
      const nextProps = {
        ...defaultProps,
        position: { lat: 12, lng: 14 },
        currentRefinement: null,
      };

      const state = {
        hasMapMoveSinceLastRefine: true,
        previousPosition: { lat: 10, lng: 12 },
        previousCurrentRefinement: null,
      };

      const actual = Connector.getDerivedStateFromProps(nextProps, state);

      const expectation = {
        hasMapMoveSinceLastRefine: false,
        previousPosition: { lat: 12, lng: 14 },
        previousCurrentRefinement: null,
      };

      expect(actual).toEqual(expectation);
    });

    it('expect reset hasMapMoveSinceLastRefine when currentRefinement change', () => {
      const nextProps = {
        ...defaultProps,
        position: null,
        currentRefinement: {
          northEast: { lat: 12, lng: 14 },
          southWest: { lat: 14, lng: 16 },
        },
      };

      const state = {
        hasMapMoveSinceLastRefine: true,
        previousPosition: null,
        previousCurrentRefinement: {
          northEast: { lat: 10, lng: 12 },
          southWest: { lat: 12, lng: 14 },
        },
      };

      const actual = Connector.getDerivedStateFromProps(nextProps, state);

      const expectation = {
        hasMapMoveSinceLastRefine: false,
        previousPosition: null,
        previousCurrentRefinement: {
          northEast: { lat: 12, lng: 14 },
          southWest: { lat: 14, lng: 16 },
        },
      };

      expect(actual).toEqual(expectation);
    });

    it('expect to not reset hasMapMoveSinceLastRefine when nothing change', () => {
      const nextProps = {
        ...defaultProps,
        position: { lat: 10, lng: 12 },
        currentRefinement: {
          northEast: { lat: 10, lng: 12 },
          southWest: { lat: 12, lng: 14 },
        },
      };

      const state = {
        hasMapMoveSinceLastRefine: true,
        previousPosition: { lat: 10, lng: 12 },
        previousCurrentRefinement: {
          northEast: { lat: 10, lng: 12 },
          southWest: { lat: 12, lng: 14 },
        },
      };

      const actual = Connector.getDerivedStateFromProps(nextProps, state);

      const expectation = {
        previousPosition: { lat: 10, lng: 12 },
        previousCurrentRefinement: {
          northEast: { lat: 10, lng: 12 },
          southWest: { lat: 12, lng: 14 },
        },
      };

      expect(actual).toEqual(expectation);
    });
  });

  describe('setMapMoveSinceLastRefine', () => {
    it('expect to update the state with the given value', () => {
      const children = jest.fn((x) => x);

      const props = {
        ...defaultProps,
      };

      const wrapper = shallow(<Connector {...props}>{children}</Connector>);

      lastRenderArgs(children).setMapMoveSinceLastRefine(true);

      expect(wrapper.state().hasMapMoveSinceLastRefine).toBe(true);
    });

    it('expect to only update the state when the given is different', () => {
      const children = jest.fn((x) => x);

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
      const children = jest.fn((x) => x);

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
