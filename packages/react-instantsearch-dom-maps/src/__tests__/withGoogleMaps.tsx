import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import withGoogleMaps, {
  GoogleMapsContext,
  WithGoogleMapsProps,
} from '../withGoogleMaps';

Enzyme.configure({ adapter: new Adapter() });

describe('withGoogleMaps', () => {
  interface Props extends WithGoogleMapsProps {
    value: number;
  }

  const createFakeContext = ({
    google = {} as any,
    googleMapsInstance = {} as any,
  }): GoogleMapsContext => ({
    // eslint-disable-next-line @typescript-eslint/camelcase
    __ais_geo_search__google_maps__: {
      instance: googleMapsInstance,
      google,
    },
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
        data: [10, 20, 30],
        radius: 50,
      });

      heatmap.getMap();

      return null;
    });

    mount(<Fake value={10} />, {
      context: createFakeContext({
        google: fakeGoogle,
      }),
    });

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

    mount(<Fake value={10} />, {
      context: createFakeContext({
        googleMapsInstance: fakeGoogleMapsInstance,
      }),
    });

    expect(fakeGoogleMapsInstance.fitBounds).toHaveBeenCalledWith({
      north: 10,
      east: 12,
      south: 14,
      west: 16,
    });
  });
});
