/**
 * @jest-environment jsdom
 */

import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { mount } from 'enzyme';
import React from 'react';

import GoogleMapsContext from '../GoogleMapsContext';
import withGoogleMaps from '../withGoogleMaps';

import type { GoogleMapsContextState } from '../GoogleMapsContext';
import type { WithGoogleMapsProps } from '../withGoogleMaps';

Enzyme.configure({ adapter: new Adapter() });

describe('withGoogleMaps', () => {
  interface Props extends WithGoogleMapsProps {
    value: number;
  }

  const createFakeContext = ({
    google = {} as any,
    googleMapsInstance = {} as any,
  }): GoogleMapsContextState => ({
    instance: googleMapsInstance,
    google,
  });

  it('expect to inject `google` prop', () => {
    const fakeGoogle: any = {
      maps: {
        visualization: {
          HeatmapLayer: jest.fn(() => ({
            getMap() {
              return null;
            },
          })),
        },
      },
    };

    const Fake = withGoogleMaps(({ google }: Props) => {
      const heatmap = new google.maps.visualization.HeatmapLayer({
        // Google Maps expects `LatLng | WeightedLocation` but we don't have access to the whole `google`
        // instance in the test.
        // We use `data` just to make sure that `Fake` correctly calls `HeatmapLayer` so the type issue is fine.
        data: [10, 20, 30] as any,
        radius: 50,
      });

      heatmap.getMap();

      return null;
    });

    mount(
      <GoogleMapsContext.Provider
        value={createFakeContext({
          google: fakeGoogle,
        })}
      >
        <Fake value={10} />
      </GoogleMapsContext.Provider>
    );

    expect(fakeGoogle.maps.visualization.HeatmapLayer).toHaveBeenCalledWith({
      data: [10, 20, 30],
      radius: 50,
    });
  });

  it('expect to inject `googleMapsInstance` prop', () => {
    const fakeGoogleMapsInstance: any = {
      fitBounds: jest.fn(),
    };

    const Fake = withGoogleMaps(({ googleMapsInstance }: Props) => {
      googleMapsInstance.fitBounds({
        north: 10,
        east: 12,
        south: 14,
        west: 16,
      });

      return null;
    });

    mount(
      <GoogleMapsContext.Provider
        value={createFakeContext({
          googleMapsInstance: fakeGoogleMapsInstance,
        })}
      >
        <Fake value={10} />
      </GoogleMapsContext.Provider>
    );

    expect(fakeGoogleMapsInstance.fitBounds).toHaveBeenCalledWith({
      north: 10,
      east: 12,
      south: 14,
      west: 16,
    });
  });
});
