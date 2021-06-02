import {
  aroundLatLngToPosition,
  insideBoundingBoxToBoundingBox,
  LatLng,
} from '../geo-search';

describe('aroundLatLngToPosition', () => {
  it.each([
    ['10,12', { lat: 10, lng: 12 }],
    ['10,    12', { lat: 10, lng: 12 }],
    ['10.15,12', { lat: 10.15, lng: 12 }],
    ['10,12.15', { lat: 10, lng: 12.15 }],
  ])('expect to return a Position from a string: %j', (input, expectation) => {
    expect(aroundLatLngToPosition(input)).toEqual(expectation);
  });

  it.each([['10a,12'], ['10.    12']])(
    'expect to throw an error with: %j',
    input => {
      expect(() => aroundLatLngToPosition(input)).toThrow(
        `Invalid value for "aroundLatLng" parameter: "${input}"`
      );
    }
  );
});

describe('insideBoundingBoxToBoundingBox', () => {
  it.each([
    [
      '10,12,12,14',
      {
        northEast: { lat: 10, lng: 12 },
        southWest: { lat: 12, lng: 14 },
      },
    ],
    [
      '10,   12    ,12      ,    14',
      {
        northEast: { lat: 10, lng: 12 },
        southWest: { lat: 12, lng: 14 },
      },
    ],
    [
      '10.15,12.15,12.15,14.15',
      {
        northEast: { lat: 10.15, lng: 12.15 },
        southWest: { lat: 12.15, lng: 14.15 },
      },
    ],
  ])(
    'expect to return a BoundingBox from a string: %j',
    (input, expectation) => {
      expect(insideBoundingBoxToBoundingBox(input)).toEqual(expectation);
    }
  );

  it.each([
    [
      [[10, 12, 12, 14]] as LatLng,
      {
        northEast: { lat: 10, lng: 12 },
        southWest: { lat: 12, lng: 14 },
      },
    ],
    [
      [[10.15, 12.15, 12.15, 14.15]] as LatLng,
      {
        northEast: { lat: 10.15, lng: 12.15 },
        southWest: { lat: 12.15, lng: 14.15 },
      },
    ],
  ])(
    'expect to return a BoundingBox from an array: %j',
    (input, expectation) => {
      expect(insideBoundingBoxToBoundingBox(input)).toEqual(expectation);
    }
  );

  it.each([[''], ['10'], ['10,12'], ['10,12,12'], ['10.  15,12,12']])(
    'expect to throw an error with: %j',
    input => {
      expect(() => insideBoundingBoxToBoundingBox(input)).toThrow(
        `Invalid value for "insideBoundingBox" parameter: "${input}"`
      );
    }
  );

  it.each([[[]], [[[]]]])('expect to throw an error with: %j', input => {
    // @ts-expect-error
    expect(() => insideBoundingBoxToBoundingBox(input)).toThrow(
      `Invalid value for "insideBoundingBox" parameter: [${input}]`
    );
  });
});
