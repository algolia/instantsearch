/**
 * @jest-environment jsdom
 */

import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { mount, shallow } from 'enzyme';
import { createSerializer } from 'enzyme-to-json';
import React from 'react';
import ReactDOM from 'react-dom';

import {
  createFakeGoogleReference,
  createFakeMapInstance,
  createFakeHTMLMarkerInstance,
} from '../../test/mockGoogleMaps';
import Connected, { CustomMarker } from '../CustomMarker';
import createHTMLMarker from '../elements/createHTMLMarker';
import GoogleMapsContext from '../GoogleMapsContext';
import * as utils from '../utils';

expect.addSnapshotSerializer(createSerializer());
Enzyme.configure({ adapter: new Adapter() });

jest.mock('../elements/createHTMLMarker', () => jest.fn());

jest.mock('../utils');

describe('CustomMarker', () => {
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

    // Register default implementation
    utils.registerEvents.mockImplementation(() => jest.fn());
  });

  describe('creation', () => {
    it('expect to create the marker on didMount with default options', () => {
      const marker = createFakeHTMLMarkerInstance();
      const factory = jest.fn(() => marker);
      const mapInstance = createFakeMapInstance();
      const google = createFakeGoogleReference({
        mapInstance,
      });

      createHTMLMarker.mockImplementationOnce(() => factory);

      const props = {
        ...defaultProps,
        googleMapsInstance: mapInstance,
        google,
      };

      const wrapper = shallow(
        <CustomMarker {...props}>
          <span>This is the children.</span>
        </CustomMarker>
      );

      expect(createHTMLMarker).toHaveBeenCalledWith(google);
      expect(wrapper.state('marker')).toBe(marker);

      expect(factory).toHaveBeenCalledTimes(1);
      expect(factory).toHaveBeenCalledWith(
        expect.objectContaining({
          map: mapInstance,
          position: {
            lat: 10,
            lng: 12,
          },
        })
      );
    });

    it('expect to create the marker on didMount with given options', () => {
      const marker = createFakeHTMLMarkerInstance();
      const factory = jest.fn(() => marker);
      const mapInstance = createFakeMapInstance();
      const google = createFakeGoogleReference({
        mapInstance,
      });

      createHTMLMarker.mockImplementationOnce(() => factory);

      const props = {
        ...defaultProps,
        className: 'my-marker',
        googleMapsInstance: mapInstance,
        anchor: {
          x: 10,
          y: 10,
        },
        google,
      };

      shallow(
        <CustomMarker {...props}>
          <span>This is the children.</span>
        </CustomMarker>
      );

      expect(factory).toHaveBeenCalledWith(
        expect.objectContaining({
          className: 'my-marker',
          anchor: {
            x: 10,
            y: 10,
          },
        })
      );
    });

    it('expect to register the listeners on didMount', () => {
      const marker = createFakeHTMLMarkerInstance();
      const factory = jest.fn(() => marker);
      const mapInstance = createFakeMapInstance();
      const google = createFakeGoogleReference({
        mapInstance,
      });

      createHTMLMarker.mockImplementationOnce(() => factory);

      const props = {
        ...defaultProps,
        googleMapsInstance: mapInstance,
        google,
      };

      shallow(
        <CustomMarker {...props}>
          <span>This is the children.</span>
        </CustomMarker>
      );

      expect(utils.registerEvents).toHaveBeenCalledTimes(2); // cDM + cDU
      expect(utils.registerEvents).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        marker
      );
    });
  });

  describe('update', () => {
    it('expect to remove the listeners on didUpdate', () => {
      const removeEventListeners = jest.fn();
      const marker = createFakeHTMLMarkerInstance();
      const factory = jest.fn(() => marker);
      const mapInstance = createFakeMapInstance();
      const google = createFakeGoogleReference({
        mapInstance,
      });

      createHTMLMarker.mockImplementationOnce(() => factory);

      utils.registerEvents.mockImplementation(() => removeEventListeners);

      const props = {
        ...defaultProps,
        googleMapsInstance: mapInstance,
        google,
      };

      shallow(
        <CustomMarker {...props}>
          <span>This is the children.</span>
        </CustomMarker>
      );

      expect(removeEventListeners).toHaveBeenCalledTimes(1);
    });

    it('expect to register the listeners on didUpdate', () => {
      const marker = createFakeHTMLMarkerInstance();
      const factory = jest.fn(() => marker);
      const mapInstance = createFakeMapInstance();
      const google = createFakeGoogleReference({
        mapInstance,
      });

      createHTMLMarker.mockImplementationOnce(() => factory);

      const props = {
        ...defaultProps,
        googleMapsInstance: mapInstance,
        google,
      };

      shallow(
        <CustomMarker {...props}>
          <span>This is the children.</span>
        </CustomMarker>
      );

      expect(utils.registerEvents).toHaveBeenCalledTimes(2); // cDM + cDU
      expect(utils.registerEvents).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        marker
      );
    });
  });

  describe('delete', () => {
    it('expect to remove the Marker on willUnmount', () => {
      const marker = createFakeHTMLMarkerInstance();
      const factory = jest.fn(() => marker);
      const mapInstance = createFakeMapInstance();
      const google = createFakeGoogleReference({
        mapInstance,
      });

      createHTMLMarker.mockImplementationOnce(() => factory);

      const props = {
        ...defaultProps,
        googleMapsInstance: mapInstance,
        google,
      };

      const wrapper = shallow(
        <CustomMarker {...props}>
          <span>This is the children.</span>
        </CustomMarker>
      );

      wrapper.unmount();

      expect(marker.setMap).toHaveBeenCalledTimes(1);
      expect(marker.setMap).toHaveBeenCalledWith(null);
    });
  });

  describe('with portal', () => {
    it('expect to render correctly', () => {
      const unstableRenderSubtreeIntoContainer = jest.spyOn(
        ReactDOM,
        'unstable_renderSubtreeIntoContainer'
      );

      const marker = createFakeHTMLMarkerInstance();
      const factory = jest.fn(() => marker);
      const mapInstance = createFakeMapInstance();
      const google = createFakeGoogleReference({
        mapInstance,
      });

      createHTMLMarker.mockImplementationOnce(() => factory);

      utils.registerEvents.mockImplementation(() => () => {});

      const props = {
        ...defaultProps,
        googleMapsInstance: mapInstance,
        google,
      };

      // Use `mount` instead of `shallow` to trigger the render
      // of createPortal otherwise the Snapshot is empty
      const wrapper = mount(
        <CustomMarker {...props}>
          <span>This is the children.</span>
        </CustomMarker>
      );

      expect(wrapper).toMatchSnapshot();

      expect(unstableRenderSubtreeIntoContainer).not.toHaveBeenCalled();

      unstableRenderSubtreeIntoContainer.mockReset();
      unstableRenderSubtreeIntoContainer.mockRestore();
    });

    it('expect to render correctly without a marker', () => {
      const mapInstance = createFakeMapInstance();
      const google = createFakeGoogleReference({
        mapInstance,
      });

      const props = {
        ...defaultProps,
        googleMapsInstance: mapInstance,
        google,
      };

      const wrapper = shallow(
        <CustomMarker {...props}>
          <span>This is the children.</span>
        </CustomMarker>,
        {
          disableLifecycleMethods: true,
        }
      );

      expect(wrapper.type()).toBe(null);
    });

    it('expect to not render on didUpdate', () => {
      const unstableRenderSubtreeIntoContainer = jest.spyOn(
        ReactDOM,
        'unstable_renderSubtreeIntoContainer'
      );

      const marker = createFakeHTMLMarkerInstance();
      const factory = jest.fn(() => marker);
      const mapInstance = createFakeMapInstance();
      const google = createFakeGoogleReference({
        mapInstance,
      });

      createHTMLMarker.mockImplementationOnce(() => factory);

      utils.registerEvents.mockImplementation(() => () => {});

      const props = {
        ...defaultProps,
        googleMapsInstance: mapInstance,
        google,
      };

      // Use `mount` instead of `shallow` to trigger didUpdate
      const wrapper = mount(
        <CustomMarker {...props}>
          <span>This is the children.</span>
        </CustomMarker>
      );

      expect(unstableRenderSubtreeIntoContainer).not.toHaveBeenCalled();

      wrapper.instance().componentDidUpdate();

      expect(unstableRenderSubtreeIntoContainer).not.toHaveBeenCalled();

      unstableRenderSubtreeIntoContainer.mockReset();
      unstableRenderSubtreeIntoContainer.mockRestore();
    });

    it('expect to not call unmountComponentAtNode on willUnmount', () => {
      const unmountComponentAtNode = jest.spyOn(
        ReactDOM,
        'unmountComponentAtNode'
      );

      const marker = createFakeHTMLMarkerInstance();
      const factory = jest.fn(() => marker);
      const mapInstance = createFakeMapInstance();
      const google = createFakeGoogleReference({
        mapInstance,
      });

      createHTMLMarker.mockImplementationOnce(() => factory);

      const props = {
        ...defaultProps,
        googleMapsInstance: mapInstance,
        google,
      };

      const wrapper = shallow(
        <CustomMarker {...props}>
          <span>This is the children.</span>
        </CustomMarker>
      );

      wrapper.unmount();

      expect(unmountComponentAtNode).not.toHaveBeenCalled();

      unmountComponentAtNode.mockReset();
      unmountComponentAtNode.mockRestore();
    });
  });

  describe('with unstable_renderSubtreeIntoContainer', () => {
    it('expect to render correctly', () => {
      const unstableRenderSubtreeIntoContainer = jest.spyOn(
        ReactDOM,
        'unstable_renderSubtreeIntoContainer'
      );

      const isReact16 = jest
        .spyOn(CustomMarker, 'isReact16')
        .mockImplementation(() => false);

      const marker = createFakeHTMLMarkerInstance();
      const factory = jest.fn(() => marker);
      const mapInstance = createFakeMapInstance();
      const google = createFakeGoogleReference({
        mapInstance,
      });

      createHTMLMarker.mockImplementationOnce(() => factory);

      utils.registerEvents.mockImplementation(() => () => {});

      const props = {
        ...defaultProps,
        googleMapsInstance: mapInstance,
        google,
      };

      const wrapper = mount(
        <CustomMarker {...props}>
          <span>This is the children.</span>
        </CustomMarker>
      );

      expect(wrapper).toMatchSnapshot();

      expect(unstableRenderSubtreeIntoContainer).toHaveBeenCalledTimes(1);
      expect(unstableRenderSubtreeIntoContainer).toHaveBeenCalledWith(
        wrapper.instance(),
        <span>This is the children.</span>,
        marker.element
      );

      unstableRenderSubtreeIntoContainer.mockReset();
      unstableRenderSubtreeIntoContainer.mockRestore();

      isReact16.mockReset();
      isReact16.mockRestore();
    });

    it('expect to render correctly without a marker', () => {
      const isReact16 = jest
        .spyOn(CustomMarker, 'isReact16')
        .mockImplementation(() => false);

      const mapInstance = createFakeMapInstance();
      const google = createFakeGoogleReference({
        mapInstance,
      });

      const props = {
        ...defaultProps,
        googleMapsInstance: mapInstance,
        google,
      };

      const wrapper = shallow(
        <CustomMarker {...props}>
          <span>This is the children.</span>
        </CustomMarker>,
        {
          disableLifecycleMethods: true,
        }
      );

      expect(wrapper.type()).toBe(null);

      isReact16.mockReset();
      isReact16.mockRestore();
    });

    it('expect to render on didUpdate', () => {
      const unstableRenderSubtreeIntoContainer = jest.spyOn(
        ReactDOM,
        'unstable_renderSubtreeIntoContainer'
      );

      const isReact16 = jest
        .spyOn(CustomMarker, 'isReact16')
        .mockImplementation(() => false);

      const marker = createFakeHTMLMarkerInstance();
      const factory = jest.fn(() => marker);
      const mapInstance = createFakeMapInstance();
      const google = createFakeGoogleReference({
        mapInstance,
      });

      createHTMLMarker.mockImplementationOnce(() => factory);

      utils.registerEvents.mockImplementation(() => () => {});

      const props = {
        ...defaultProps,
        googleMapsInstance: mapInstance,
        google,
      };

      // Use `mount` instead of `shallow` to avoid issue with `unstable_renderSubtreeIntoContainer`
      const wrapper = mount(
        <CustomMarker {...props}>
          <span>This is the children.</span>
        </CustomMarker>
      );

      expect(unstableRenderSubtreeIntoContainer).toHaveBeenCalledTimes(1);
      expect(unstableRenderSubtreeIntoContainer).toHaveBeenCalledWith(
        wrapper.instance(),
        <span>This is the children.</span>,
        marker.element
      );

      wrapper.instance().componentDidUpdate();

      expect(unstableRenderSubtreeIntoContainer).toHaveBeenCalledTimes(2);
      expect(unstableRenderSubtreeIntoContainer).toHaveBeenCalledWith(
        wrapper.instance(),
        <span>This is the children.</span>,
        marker.element
      );

      unstableRenderSubtreeIntoContainer.mockReset();
      unstableRenderSubtreeIntoContainer.mockRestore();

      isReact16.mockReset();
      isReact16.mockRestore();
    });

    it('expect to call unmountComponentAtNode on willUnmount', () => {
      const unmountComponentAtNode = jest.spyOn(
        ReactDOM,
        'unmountComponentAtNode'
      );

      const isReact16 = jest
        .spyOn(CustomMarker, 'isReact16')
        .mockImplementation(() => false);

      const marker = createFakeHTMLMarkerInstance();
      const factory = jest.fn(() => marker);
      const mapInstance = createFakeMapInstance();
      const google = createFakeGoogleReference({
        mapInstance,
      });

      createHTMLMarker.mockImplementationOnce(() => factory);

      const props = {
        ...defaultProps,
        googleMapsInstance: mapInstance,
        google,
      };

      // Use `mount` instead of `shallow` to avoid issue with `unstable_renderSubtreeIntoContainer`
      const wrapper = mount(
        <CustomMarker {...props}>
          <span>This is the children.</span>
        </CustomMarker>
      );

      wrapper.unmount();

      expect(unmountComponentAtNode).toHaveBeenCalledWith(marker.element);

      unmountComponentAtNode.mockReset();
      unmountComponentAtNode.mockRestore();

      isReact16.mockReset();
      isReact16.mockRestore();
    });
  });

  describe('Connected', () => {
    it('expect to have access to Google Maps', () => {
      const marker = createFakeHTMLMarkerInstance();
      const factory = jest.fn(() => marker);
      const mapInstance = createFakeMapInstance();
      const google = createFakeGoogleReference({
        mapInstance,
      });

      createHTMLMarker.mockImplementationOnce(() => factory);

      const props = {
        ...defaultProps,
      };

      mount(
        <GoogleMapsContext.Provider
          value={{
            instance: mapInstance,
            google,
          }}
        >
          <Connected {...props}>
            <span>This is the children.</span>
          </Connected>
        </GoogleMapsContext.Provider>
      );

      expect(createHTMLMarker).toHaveBeenCalledWith(google);

      expect(factory).toHaveBeenCalledWith(
        expect.objectContaining({
          map: mapInstance,
        })
      );
    });
  });
});
