import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { shallow } from 'enzyme';
import React from 'react';

import {
  createFakeGoogleReference,
  createFakeMapInstance,
} from '../../test/mockGoogleMaps';
import Provider from '../Provider';

Enzyme.configure({ adapter: new Adapter() });

describe('Provider', () => {
  const defaultProps = {
    google: createFakeGoogleReference(),
    hits: [],
    initialPosition: { lat: 0, lng: 0 },
    isRefineOnMapMove: true,
    hasMapMoveSinceLastRefine: false,
    isRefineEnable: true,
    refine: () => {},
    toggleRefineOnMapMove: () => {},
    setMapMoveSinceLastRefine: () => {},
    children: () => {},
  };

  const lastRenderArgs = (fn) => fn.mock.calls[fn.mock.calls.length - 1][0];

  it('expect to render with default props', () => {
    const children = jest.fn((x) => x);

    const props = {
      ...defaultProps,
    };

    shallow(<Provider {...props}>{children}</Provider>);

    expect(children).toHaveBeenCalledTimes(1);
    expect(children).toHaveBeenCalledWith({
      boundingBox: undefined,
      boundingBoxPadding: undefined,
      onChange: expect.any(Function),
      onIdle: expect.any(Function),
      shouldUpdate: expect.any(Function),
    });
  });

  describe('boundingBox', () => {
    it('expect to use hits when currentRefinement is not defined and hits are not empty', () => {
      const children = jest.fn((x) => x);
      const google = createFakeGoogleReference();

      google.maps.LatLngBounds.mockImplementation(() => ({
        extend: jest.fn().mockReturnThis(),
        getNorthEast: () => ({
          toJSON: () => ({
            lat: 10,
            lng: 10,
          }),
        }),
        getSouthWest: () => ({
          toJSON: () => ({
            lat: 14,
            lng: 14,
          }),
        }),
      }));

      const props = {
        ...defaultProps,
        hits: [
          { _geoloc: { lat: 10, lng: 12 } },
          { _geoloc: { lat: 12, lng: 14 } },
        ],
        google,
      };

      shallow(<Provider {...props}>{children}</Provider>);

      expect(lastRenderArgs(children).boundingBox).toEqual({
        northEast: {
          lat: 10,
          lng: 10,
        },
        southWest: {
          lat: 14,
          lng: 14,
        },
      });
    });

    it("expect to use currentRefinement when it's defined and hits are empty", () => {
      const children = jest.fn((x) => x);

      const props = {
        ...defaultProps,
        currentRefinement: {
          northEast: {
            lat: 10,
            lng: 12,
          },
          southWest: {
            lat: 12,
            lng: 14,
          },
        },
      };

      shallow(<Provider {...props}>{children}</Provider>);

      expect(lastRenderArgs(children).boundingBox).toEqual({
        northEast: {
          lat: 10,
          lng: 12,
        },
        southWest: {
          lat: 12,
          lng: 14,
        },
      });
    });

    it("expect to use currentRefinement when it's defined and hits are not empty", () => {
      const children = jest.fn((x) => x);

      const props = {
        ...defaultProps,
        hits: [
          { _geoloc: { lat: 10, lng: 12 } },
          { _geoloc: { lat: 12, lng: 14 } },
        ],
        currentRefinement: {
          northEast: {
            lat: 10,
            lng: 12,
          },
          southWest: {
            lat: 12,
            lng: 14,
          },
        },
      };

      shallow(<Provider {...props}>{children}</Provider>);

      expect(lastRenderArgs(children).boundingBox).toEqual({
        northEast: {
          lat: 10,
          lng: 12,
        },
        southWest: {
          lat: 12,
          lng: 14,
        },
      });
    });

    it("expect to use currentRefinement when it's not defined and hits are empty", () => {
      const children = jest.fn((x) => x);

      const props = {
        ...defaultProps,
      };

      shallow(<Provider {...props}>{children}</Provider>);

      expect(lastRenderArgs(children).boundingBox).toBe(undefined);
    });
  });

  describe('onChange', () => {
    it('expect to call setMapMoveSinceLast refine', () => {
      const children = jest.fn((x) => x);

      const props = {
        ...defaultProps,
        setMapMoveSinceLastRefine: jest.fn(),
      };

      shallow(<Provider {...props}>{children}</Provider>);

      expect(props.setMapMoveSinceLastRefine).toHaveBeenCalledTimes(0);

      lastRenderArgs(children).onChange();

      expect(props.setMapMoveSinceLastRefine).toHaveBeenCalledTimes(1);
      expect(props.setMapMoveSinceLastRefine).toHaveBeenCalledWith(true);
    });

    it('expect to schedule a refine call when refine on map move is enabled', () => {
      const children = jest.fn((x) => x);

      const props = {
        ...defaultProps,
      };

      const wrapper = shallow(<Provider {...props}>{children}</Provider>);

      expect(wrapper.instance().isPendingRefine).toBe(false);

      lastRenderArgs(children).onChange();

      expect(wrapper.instance().isPendingRefine).toBe(true);
    });

    it('expect to not schedule a refine call when refine on map move is disabled', () => {
      const children = jest.fn((x) => x);

      const props = {
        ...defaultProps,
        isRefineOnMapMove: false,
      };

      const wrapper = shallow(<Provider {...props}>{children}</Provider>);

      expect(wrapper.instance().isPendingRefine).toBe(false);

      lastRenderArgs(children).onChange();

      expect(wrapper.instance().isPendingRefine).toBe(false);
    });

    it('expect to do nothing when refine is disabled', () => {
      const children = jest.fn((x) => x);

      const props = {
        ...defaultProps,
        isRefineEnable: false,
        setMapMoveSinceLastRefine: jest.fn(),
      };

      const wrapper = shallow(<Provider {...props}>{children}</Provider>);

      expect(wrapper.instance().isPendingRefine).toBe(false);

      lastRenderArgs(children).onChange();

      expect(wrapper.instance().isPendingRefine).toBe(false);
      expect(props.setMapMoveSinceLastRefine).not.toHaveBeenCalled();
    });
  });

  describe('onIdle', () => {
    it('expect to call refine when there is a pending refinement', () => {
      const mapInstance = createFakeMapInstance();
      const children = jest.fn((x) => x);

      mapInstance.getBounds.mockImplementation(() => ({
        getNorthEast: () => ({
          toJSON: () => ({
            lat: 10,
            lng: 12,
          }),
        }),
        getSouthWest: () => ({
          toJSON: () => ({
            lat: 12,
            lng: 14,
          }),
        }),
      }));

      const props = {
        ...defaultProps,
        refine: jest.fn(),
      };

      shallow(<Provider {...props}>{children}</Provider>);

      lastRenderArgs(children).onChange();
      lastRenderArgs(children).onIdle({ instance: mapInstance });

      expect(props.refine).toHaveBeenCalledTimes(1);
      expect(props.refine).toHaveBeenCalledWith({
        northEast: {
          lat: 10,
          lng: 12,
        },
        southWest: {
          lat: 12,
          lng: 14,
        },
      });
    });

    it('expect to reset the pending refinement when there is a pending refinement', () => {
      const mapInstance = createFakeMapInstance();
      const children = jest.fn((x) => x);

      mapInstance.getBounds.mockImplementation(() => ({
        getNorthEast: () => ({
          toJSON: () => {},
        }),
        getSouthWest: () => ({
          toJSON: () => {},
        }),
      }));

      const props = {
        ...defaultProps,
        refine: jest.fn(),
      };

      const wrapper = shallow(<Provider {...props}>{children}</Provider>);

      lastRenderArgs(children).onChange();

      expect(wrapper.instance().isPendingRefine).toBe(true);

      lastRenderArgs(children).onIdle({ instance: mapInstance });

      expect(wrapper.instance().isPendingRefine).toBe(false);
    });

    it('expect to do nothing when there is no pending refinement', () => {
      const mapInstance = createFakeMapInstance();
      const children = jest.fn((x) => x);

      const props = {
        ...defaultProps,
        refine: jest.fn(),
        setMapMoveSinceLastRefine: jest.fn(),
      };

      const wrapper = shallow(<Provider {...props}>{children}</Provider>);

      expect(wrapper.instance().isPendingRefine).toBe(false);

      lastRenderArgs(children).onIdle({ instance: mapInstance });

      expect(wrapper.instance().isPendingRefine).toBe(false);
      expect(props.refine).not.toHaveBeenCalled();
      expect(props.setMapMoveSinceLastRefine).not.toHaveBeenCalled();
    });
  });

  describe('shouldUpdate', () => {
    it("expect to return true when no refinement is pending and the map didn't moved", () => {
      const children = jest.fn((x) => x);

      const props = {
        ...defaultProps,
      };

      shallow(<Provider {...props}>{children}</Provider>);

      const actual = lastRenderArgs(children).shouldUpdate();

      expect(actual).toBe(true);
    });

    it('expect to return false when there is a pending refinement', () => {
      const children = jest.fn((x) => x);

      const props = {
        ...defaultProps,
      };

      shallow(<Provider {...props}>{children}</Provider>);

      lastRenderArgs(children).onChange();

      const actual = lastRenderArgs(children).shouldUpdate();

      expect(actual).toBe(false);
    });

    it('expect to return false when the map has moved', () => {
      const children = jest.fn((x) => x);

      const props = {
        ...defaultProps,
        hasMapMoveSinceLastRefine: true,
      };

      shallow(<Provider {...props}>{children}</Provider>);

      const actual = lastRenderArgs(children).shouldUpdate();

      expect(actual).toBe(false);
    });
  });

  describe('context', () => {
    it('expect to expose isRefineOnMapMove', () => {
      const props = {
        ...defaultProps,
      };

      const wrapper = shallow(<Provider {...props}>{(x) => x}</Provider>);

      expect(wrapper.props().value.isRefineOnMapMove).toBe(true);
    });

    it('expect to expose hasMapMoveSinceLastRefine', () => {
      const props = {
        ...defaultProps,
      };

      const wrapper = shallow(<Provider {...props}>{(x) => x}</Provider>);

      expect(wrapper.props().value.hasMapMoveSinceLastRefine).toBe(false);
    });

    it('expect to expose toggleRefineOnMapMove', () => {
      const props = {
        ...defaultProps,
      };

      const wrapper = shallow(<Provider {...props}>{(x) => x}</Provider>);

      expect(wrapper.props().value.toggleRefineOnMapMove).toBe(
        props.toggleRefineOnMapMove
      );
    });

    it('expect to expose setMapMoveSinceLastRefine', () => {
      const props = {
        ...defaultProps,
      };

      const wrapper = shallow(<Provider {...props}>{(x) => x}</Provider>);

      expect(wrapper.props().value.setMapMoveSinceLastRefine).toBe(
        props.setMapMoveSinceLastRefine
      );
    });

    it('expect to expose refineWithInstance', () => {
      const props = {
        ...defaultProps,
      };

      const wrapper = shallow(<Provider {...props}>{(x) => x}</Provider>);

      expect(wrapper.props().value.refineWithInstance).toBe(
        wrapper.instance().refineWithInstance
      );
    });

    it('expect to pass new mapValue reference when isRefineOnMapMove changes', () => {
      const props = {
        ...defaultProps,
        isRefineOnMapMove: true,
      };

      const wrapper = shallow(<Provider {...props} />);
      const mapValue = wrapper.instance().mapValue;

      expect(mapValue).toBe(wrapper.instance().mapValue);

      wrapper.setProps({
        isRefineOnMapMove: false,
      });

      expect(mapValue).not.toBe(wrapper.instance().mapValue);
    });

    it('expect to pass new mapValue reference when hasMapMoveSinceLastRefine changes', () => {
      const props = {
        ...defaultProps,
        hasMapMoveSinceLastRefine: false,
      };

      const wrapper = shallow(<Provider {...props} />);
      const mapValue = wrapper.instance().mapValue;

      expect(mapValue).toBe(wrapper.instance().mapValue);

      wrapper.setProps({
        hasMapMoveSinceLastRefine: true,
      });

      expect(mapValue).not.toBe(wrapper.instance().mapValue);
    });

    it('expect to pass same mapValue reference when toggleRefineOnMapMove changes', () => {
      const props = {
        ...defaultProps,
        toggleRefineOnMapMove: jest.fn(),
      };

      const wrapper = shallow(<Provider {...props} />);
      const mapValue = wrapper.instance().mapValue;

      expect(mapValue).toBe(wrapper.instance().mapValue);

      wrapper.setProps({
        toggleRefineOnMapMove: jest.fn(),
      });

      expect(mapValue).toBe(wrapper.instance().mapValue);
    });

    it('expect to pass same mapValue reference when setMapMoveSinceLastRefine changes', () => {
      const props = {
        ...defaultProps,
        setMapMoveSinceLastRefine: jest.fn(),
      };

      const wrapper = shallow(<Provider {...props} />);
      const mapValue = wrapper.instance().mapValue;

      expect(mapValue).toBe(wrapper.instance().mapValue);

      wrapper.setProps({
        setMapMoveSinceLastRefine: jest.fn(),
      });

      expect(mapValue).toBe(wrapper.instance().mapValue);
    });

    it('expect to pass same mapValue reference when refineWithInstance changes', () => {
      const props = {
        ...defaultProps,
        refineWithInstance: jest.fn(),
      };

      const wrapper = shallow(<Provider {...props} />);
      const mapValue = wrapper.instance().mapValue;

      expect(mapValue).toBe(wrapper.instance().mapValue);

      wrapper.setProps({
        refineWithInstance: jest.fn(),
      });

      expect(mapValue).toBe(wrapper.instance().mapValue);
    });
  });
});
