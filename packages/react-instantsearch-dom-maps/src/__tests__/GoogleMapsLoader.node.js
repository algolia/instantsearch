/**
 * @jest-environment node
 */

describe('GoogleMapsLoader', () => {
  it('expect to require the file in a Node environment', () => {
    expect(() => require('../GoogleMapsLoader')).not.toThrowError();
  });
});
