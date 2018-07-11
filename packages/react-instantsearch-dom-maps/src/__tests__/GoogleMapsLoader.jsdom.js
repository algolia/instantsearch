import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import injectScript from 'scriptjs';
import GoogleMapsLoader from '../GoogleMapsLoader';

Enzyme.configure({ adapter: new Adapter() });

jest.mock('scriptjs');

describe('GoogleMapsLoader', () => {
  const defaultProps = {
    apiKey: 'API_KEY',
  };

  const flushPendingMicroTasks = () =>
    new Promise(resolve => setImmediate(resolve));

  it('expect to call Google Maps API', () => {
    const children = jest.fn(x => x);

    const props = {
      ...defaultProps,
    };

    shallow(<GoogleMapsLoader {...props}>{children}</GoogleMapsLoader>);

    return flushPendingMicroTasks().then(() => {
      expect(injectScript).toHaveBeenLastCalledWith(
        'https://maps.googleapis.com/maps/api/js?v=3.31&key=API_KEY',
        expect.any(Function)
      );
    });
  });

  it('expect to call Google Maps API with a custom API Key', () => {
    const children = jest.fn(x => x);

    const props = {
      ...defaultProps,
      apiKey: 'CUSTOM_API_KEY',
    };

    shallow(<GoogleMapsLoader {...props}>{children}</GoogleMapsLoader>);

    return flushPendingMicroTasks().then(() => {
      expect(injectScript).toHaveBeenLastCalledWith(
        'https://maps.googleapis.com/maps/api/js?v=3.31&key=CUSTOM_API_KEY',
        expect.any(Function)
      );
    });
  });

  it('expect to call Google Maps API with a custom endpoint', () => {
    const children = jest.fn(x => x);

    const props = {
      ...defaultProps,
      endpoint:
        'https://maps.googleapis.com/maps/api/js?v=3.32&places,geometry',
    };

    shallow(<GoogleMapsLoader {...props}>{children}</GoogleMapsLoader>);

    return flushPendingMicroTasks().then(() => {
      expect(injectScript).toHaveBeenLastCalledWith(
        'https://maps.googleapis.com/maps/api/js?v=3.32&places,geometry&key=API_KEY',
        expect.any(Function)
      );
    });
  });

  it("expect to render nothing when it's loading", () => {
    const children = jest.fn(x => x);

    const props = {
      ...defaultProps,
    };

    const wrapper = shallow(
      <GoogleMapsLoader {...props}>{children}</GoogleMapsLoader>
    );

    expect(wrapper.type()).toBe(null);
    expect(children).not.toHaveBeenCalled();
  });

  it("expect to call children with the Google object when it's loaded", () => {
    const children = jest.fn(x => x);

    const google = {
      version: '3.1.1',
    };

    const props = {
      ...defaultProps,
    };

    injectScript.mockImplementationOnce((_, callback) => {
      global.google = google;
      callback();
    });

    const wrapper = shallow(
      <GoogleMapsLoader {...props}>{children}</GoogleMapsLoader>
    );

    return flushPendingMicroTasks().then(() => {
      expect(wrapper.type).not.toBe(null);
      expect(children).toHaveBeenCalledTimes(1);
      expect(children).toHaveBeenCalledWith(google);

      delete global.google;
    });
  });

  it('expect to not call setState when we unmount before loading is complete', () => {
    const children = jest.fn(x => x);

    const props = {
      ...defaultProps,
    };

    let triggerLoadingComplete;
    injectScript.mockImplementationOnce((endpoint, callback) => {
      triggerLoadingComplete = callback;
    });

    const wrapper = shallow(
      <GoogleMapsLoader {...props}>{children}</GoogleMapsLoader>
    );

    return flushPendingMicroTasks().then(() => {
      expect(wrapper.type).not.toBe(null);
      expect(children).not.toHaveBeenCalled();

      wrapper.unmount();

      triggerLoadingComplete();

      expect(children).not.toHaveBeenCalled();
    });
  });
});
