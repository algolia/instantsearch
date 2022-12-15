export class FakeOverlayView {
  setMap = jest.fn();

  getPanes = jest.fn(() => ({
    overlayMouseTarget: {
      appendChild: jest.fn(),
    },
  }));

  getProjection = jest.fn(() => ({
    fromLatLngToDivPixel: jest.fn(() => ({
      x: 0,
      y: 0,
    })),
  }));
}

export const MockLatLngBounds = jest.fn((ne, sw) => ({
  northEast: ne,
  southWest: sw,
  equals(oldBounds) {
    if (!oldBounds) {
      return false;
    }
    return (
      oldBounds.northEast.lat === this.northEast.lat &&
      oldBounds.northEast.lng === this.northEast.lng &&
      oldBounds.southWest.lat === this.southWest.lat &&
      oldBounds.southWest.lng === this.southWest.lng
    );
  },
}));

export const createFakeMapInstance = () => ({
  addListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
  getCenter: jest.fn(),
  setCenter: jest.fn(),
  getZoom: jest.fn(),
  setZoom: jest.fn(),
  getBounds: jest.fn(
    () => new MockLatLngBounds({ lat: 0, lng: 0 }, { lat: 0, lng: 0 })
  ),
  getProjection: jest.fn(() => ({
    fromPointToLatLng: jest.fn(() => ({
      lat: jest.fn(),
      lng: jest.fn(),
    })),
    fromLatLngToPoint: jest.fn(() => ({
      x: 0,
      y: 0,
    })),
  })),
  fitBounds: jest.fn(),
});

export const createFakeMarkerInstance = () => ({
  setMap: jest.fn(),
  getPosition: jest.fn(),
  addListener: jest.fn(),
});

export const createFakeHTMLMarkerInstance = () => ({
  element: document.createElement('div'),
  setMap: jest.fn(),
  draw: jest.fn(),
});

export const createFakeGoogleReference = ({
  mapInstance = createFakeMapInstance(),
  markerInstance = createFakeMarkerInstance(),
} = {}) => ({
  maps: {
    LatLng: jest.fn((x) => x),
    LatLngBounds: MockLatLngBounds,
    Map: jest.fn(() => mapInstance),
    Marker: jest.fn(() => markerInstance),
    ControlPosition: {
      LEFT_TOP: 'left:top',
    },
    event: {
      addListenerOnce: jest.fn(() => ({
        remove: jest.fn(),
      })),
    },
    OverlayView: FakeOverlayView,
  },
});
