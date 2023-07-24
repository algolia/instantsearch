/**
 * @jest-environment jsdom
 */

import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { shallow, mount } from 'enzyme';
import React from 'react';

import {
  createFakeGoogleReference,
  createFakeMapInstance,
  createFakeMarkerInstance,
} from '../../test/mockGoogleMaps';
import GoogleMapsContext from '../GoogleMapsContext';
import Connected, { Marker } from '../Marker';
import * as utils from '../utils';

Enzyme.configure({ adapter: new Adapter() });

jest.mock('../utils', () => {
  const module = jest.requireActual('../utils');

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
      googleMapsInstance: mapInstance,
      google,
    };

    const wrapper = shallow(<Marker {...props} />);

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
        googleMapsInstance: mapInstance,
        google,
      };

      const wrapper = shallow(<Marker {...props} />, {
        disableLifecycleMethods: true,
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
        googleMapsInstance: mapInstance,
        title: 'My Marker',
        visible: false,
        children: <span />,
        onClick: () => {},
        google,
      };

      const wrapper = shallow(<Marker {...props} />, {
        disableLifecycleMethods: true,
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
        googleMapsInstance: mapInstance,
        google,
      };

      const wrapper = shallow(<Marker {...props} />, {
        disableLifecycleMethods: true,
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
        googleMapsInstance: mapInstance,
        google,
      };

      const wrapper = shallow(<Marker {...props} />);

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
        googleMapsInstance: mapInstance,
        google,
      };

      utils.registerEvents.mockImplementationOnce(() => () => {});

      const wrapper = shallow(<Marker {...props} />);

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
        googleMapsInstance: mapInstance,
        google,
      };

      const wrapper = shallow(<Marker {...props} />);

      wrapper.unmount();

      expect(markerInstance.setMap).toHaveBeenCalledTimes(1);
      expect(markerInstance.setMap).toHaveBeenCalledWith(null);
    });
  });

  describe('Connected', () => {
    it('expect to have access to Google Maps', () => {
      const mapInstance = createFakeMapInstance();
      const markerInstance = createFakeMarkerInstance();
      const google = createFakeGoogleReference({
        mapInstance,
        markerInstance,
      });

      const props = {
        ...defaultProps,
      };

      mount(
        <GoogleMapsContext.Provider
          value={{
            google,
            instance: mapInstance,
          }}
        >
          <Connected {...props} />
        </GoogleMapsContext.Provider>
      );

      expect(google.maps.Marker).toHaveBeenCalledWith({
        map: mapInstance,
        position: {
          lat: 10,
          lng: 12,
        },
      });
    });
  });
});
