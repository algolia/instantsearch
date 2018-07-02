import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {
  createFakeGoogleReference,
  createFakeMapInstance,
  createFakeMarkerInstance,
} from '../../test/mockGoogleMaps';
import * as utils from '../utils';
import { GOOGLE_MAPS_CONTEXT } from '../GoogleMaps';
import Marker from '../Marker';

Enzyme.configure({ adapter: new Adapter() });

jest.mock('../utils', () => {
  const module = require.requireActual('../utils');

  return {
    registerEvents: jest.fn(),
    createFilterProps: module.createFilterProps,
    createListenersPropTypes: module.createListenersPropTypes,
  };
});

describe('Marker', () => {
  const defaultProps = {
    hit: {
      _geoloc: {
        lat: 10,
        lng: 12,
      },
    },
  };

  beforeEach(() => {
    utils.registerEvents.mockClear();
    utils.registerEvents.mockReset();
  });

  it('expect render correctly', () => {
    const mapInstance = createFakeMapInstance();
    const google = createFakeGoogleReference({
      mapInstance,
    });

    const props = {
      ...defaultProps,
    };

    const wrapper = shallow(<Marker {...props} />, {
      context: {
        [GOOGLE_MAPS_CONTEXT]: {
          instance: mapInstance,
          google,
        },
      },
    });

    expect(wrapper.type()).toBe(null);
  });

  describe('creation', () => {
    it('expect to create the Marker on didMount with default options', () => {
      const mapInstance = createFakeMapInstance();
      const google = createFakeGoogleReference({
        mapInstance,
      });

      const props = {
        ...defaultProps,
      };

      const wrapper = shallow(<Marker {...props} />, {
        disableLifecycleMethods: true,
        context: {
          [GOOGLE_MAPS_CONTEXT]: {
            instance: mapInstance,
            google,
          },
        },
      });

      expect(google.maps.Marker).not.toHaveBeenCalled();

      // Simulate didMount
      wrapper.instance().componentDidMount();

      expect(google.maps.Marker).toHaveBeenCalledTimes(1);
      expect(google.maps.Marker).toHaveBeenCalledWith({
        map: mapInstance,
        position: {
          lat: 10,
          lng: 12,
        },
      });
    });

    it('expect to create the Marker on didMount with given options', () => {
      const mapInstance = createFakeMapInstance();
      const google = createFakeGoogleReference({
        mapInstance,
      });

      const props = {
        ...defaultProps,
        title: 'My Marker',
        visible: false,
        children: <span />,
        onClick: () => {},
      };

      const wrapper = shallow(<Marker {...props} />, {
        disableLifecycleMethods: true,
        context: {
          [GOOGLE_MAPS_CONTEXT]: {
            instance: mapInstance,
            google,
          },
        },
      });

      expect(google.maps.Marker).not.toHaveBeenCalled();

      // Simulate didMount
      wrapper.instance().componentDidMount();

      expect(google.maps.Marker).toHaveBeenCalledTimes(1);
      expect(google.maps.Marker).toHaveBeenCalledWith({
        title: 'My Marker',
        visible: false,
        map: mapInstance,
        position: {
          lat: 10,
          lng: 12,
        },
      });
    });

    it('expect to register the listeners on didMount', () => {
      const mapInstance = createFakeMapInstance();
      const markerInstance = createFakeMarkerInstance();
      const google = createFakeGoogleReference({
        mapInstance,
        markerInstance,
      });

      const props = {
        ...defaultProps,
      };

      const wrapper = shallow(<Marker {...props} />, {
        disableLifecycleMethods: true,
        context: {
          [GOOGLE_MAPS_CONTEXT]: {
            instance: mapInstance,
            google,
          },
        },
      });

      expect(utils.registerEvents).toHaveBeenCalledTimes(0);

      // Simulate didMount
      wrapper.instance().componentDidMount();

      expect(utils.registerEvents).toHaveBeenCalledTimes(1);
      expect(utils.registerEvents).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        markerInstance
      );
    });
  });

  describe('update', () => {
    it('expect to remove the listener on didUpdate', () => {
      const removeEventListeners = jest.fn();
      const mapInstance = createFakeMapInstance();
      const markerInstance = createFakeMarkerInstance();
      const google = createFakeGoogleReference({
        mapInstance,
        markerInstance,
      });

      utils.registerEvents.mockImplementation(() => removeEventListeners);

      const props = {
        ...defaultProps,
      };

      const wrapper = shallow(<Marker {...props} />, {
        context: {
          [GOOGLE_MAPS_CONTEXT]: {
            instance: mapInstance,
            google,
          },
        },
      });

      expect(removeEventListeners).toHaveBeenCalledTimes(0);

      // Simulate the update
      wrapper.instance().componentDidUpdate();

      expect(removeEventListeners).toHaveBeenCalledTimes(1);
    });

    it('expect to register the listeners on didUpdate', () => {
      const mapInstance = createFakeMapInstance();
      const markerInstance = createFakeMarkerInstance();
      const google = createFakeGoogleReference({
        mapInstance,
        markerInstance,
      });

      const props = {
        ...defaultProps,
      };

      utils.registerEvents.mockImplementationOnce(() => () => {});

      const wrapper = shallow(<Marker {...props} />, {
        context: {
          [GOOGLE_MAPS_CONTEXT]: {
            instance: mapInstance,
            google,
          },
        },
      });

      expect(utils.registerEvents).toHaveBeenCalledTimes(1);

      // Simulate the update
      wrapper.instance().componentDidUpdate();

      expect(utils.registerEvents).toHaveBeenCalledTimes(2);
      expect(utils.registerEvents).toHaveBeenLastCalledWith(
        expect.any(Object),
        expect.any(Object),
        markerInstance
      );
    });
  });

  describe('delete', () => {
    it('expect to remove the Marker on willUnmount', () => {
      const mapInstance = createFakeMapInstance();
      const markerInstance = createFakeMarkerInstance();
      const google = createFakeGoogleReference({
        mapInstance,
        markerInstance,
      });

      const props = {
        ...defaultProps,
      };

      const wrapper = shallow(<Marker {...props} />, {
        context: {
          [GOOGLE_MAPS_CONTEXT]: {
            instance: mapInstance,
            google,
          },
        },
      });

      wrapper.unmount();

      expect(markerInstance.setMap).toHaveBeenCalledTimes(1);
      expect(markerInstance.setMap).toHaveBeenCalledWith(null);
    });
  });
});
