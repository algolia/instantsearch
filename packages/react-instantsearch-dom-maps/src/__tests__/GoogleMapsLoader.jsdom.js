/**
 * @jest-environment jsdom
 */

import { wait } from '@instantsearch/testutils';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { shallow } from 'enzyme';
import React from 'react';
import injectScript from 'scriptjs';

import GoogleMapsLoader from '../GoogleMapsLoader';

Enzyme.configure({ adapter: new Adapter() });

jest.mock('scriptjs');

describe('GoogleMapsLoader', () => {
  const defaultProps = {
    apiKey: 'API_KEY',
  };

  it('expect to call Google Maps API', async () => {
    const children = jest.fn((x) => x);

    const props = {
      ...defaultProps,
    };

    shallow(<GoogleMapsLoader {...props}>{children}</GoogleMapsLoader>);

    await wait(0);

    expect(injectScript).toHaveBeenLastCalledWith(
      'https://maps.googleapis.com/maps/api/js?v=quarterly&key=API_KEY',
      expect.any(Function)
    );
  });

  it('expect to call Google Maps API with a custom API Key', async () => {
    const children = jest.fn((x) => x);

    const props = {
      ...defaultProps,
      apiKey: 'CUSTOM_API_KEY',
    };

    shallow(<GoogleMapsLoader {...props}>{children}</GoogleMapsLoader>);

    await wait(0);

    expect(injectScript).toHaveBeenLastCalledWith(
      'https://maps.googleapis.com/maps/api/js?v=quarterly&key=CUSTOM_API_KEY',
      expect.any(Function)
    );
  });

  it('expect to call Google Maps API with a custom endpoint', async () => {
    const children = jest.fn((x) => x);

    const props = {
      ...defaultProps,
      endpoint:
        'https://maps.googleapis.com/maps/api/js?v=3.32&places,geometry',
    };

    shallow(<GoogleMapsLoader {...props}>{children}</GoogleMapsLoader>);

    await wait(0);

    expect(injectScript).toHaveBeenLastCalledWith(
      'https://maps.googleapis.com/maps/api/js?v=3.32&places,geometry&key=API_KEY',
      expect.any(Function)
    );
  });

  it("expect to render nothing when it's loading", () => {
    const children = jest.fn((x) => x);

    const props = {
      ...defaultProps,
    };

    const wrapper = shallow(
      <GoogleMapsLoader {...props}>{children}</GoogleMapsLoader>
    );

    expect(wrapper.type()).toBe(null);
    expect(children).not.toHaveBeenCalled();
  });

  it("expect to call children with the Google object when it's loaded", async () => {
    const children = jest.fn((x) => x);

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

    await wait(0);

    expect(wrapper.type).not.toBe(null);
    expect(children).toHaveBeenCalledTimes(1);
    expect(children).toHaveBeenCalledWith(google);

    delete global.google;
  });

  it('expect to not call setState when we unmount before loading is complete', async () => {
    const children = jest.fn((x) => x);

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

    await wait(0);

    expect(wrapper.type).not.toBe(null);
    expect(children).not.toHaveBeenCalled();

    wrapper.unmount();

    triggerLoadingComplete();

    expect(children).not.toHaveBeenCalled();
  });
});
