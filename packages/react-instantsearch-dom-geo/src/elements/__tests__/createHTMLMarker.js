import { createFakeGoogleReference } from '../../../test/mockGoogleMaps';
import createHTMLMarker from '../createHTMLMarker';

describe('createHTMLMarker', () => {
  const createFakeParams = ({ ...rest }) => ({
    position: {
      lat: 10,
      lng: 12,
    },
    map: 'map-instance-placeholder',
    className: 'ais-geo-search-marker',
    ...rest,
  });

  it('expect to create a marker', () => {
    const googleReference = createFakeGoogleReference();
    const HTMLMarker = createHTMLMarker(googleReference);
    const params = createFakeParams();

    const marker = new HTMLMarker(params);

    expect(marker.anchor).toEqual({ x: 0, y: 0 });
    expect(marker.subscriptions).toEqual([]);
    expect(marker.latLng).toEqual({ lat: 10, lng: 12 });

    expect(marker.element).toEqual(expect.any(HTMLDivElement));
    expect(marker.element.className).toBe('ais-geo-search-marker');
    expect(marker.element.style.position).toBe('absolute');
    expect(marker.element.style.whiteSpace).toBe('nowrap');

    expect(marker.setMap).toHaveBeenCalledWith('map-instance-placeholder');
  });

  it('expect to create a marker with a custom anchor', () => {
    const googleReference = createFakeGoogleReference();
    const HTMLMarker = createHTMLMarker(googleReference);
    const params = createFakeParams({
      anchor: {
        x: 5,
        y: 10,
      },
    });

    const marker = new HTMLMarker(params);

    expect(marker.anchor).toEqual({ x: 5, y: 10 });
  });

  it('expect to create a marker with a custom className', () => {
    const googleReference = createFakeGoogleReference();
    const HTMLMarker = createHTMLMarker(googleReference);
    const params = createFakeParams({
      className: 'my-custom-marker',
    });

    const marker = new HTMLMarker(params);

    expect(marker.element.className).toBe('my-custom-marker');
  });

  describe('onAdd', () => {
    it('expect to append the element to the overlay', () => {
      const googleReference = createFakeGoogleReference();
      const HTMLMarker = createHTMLMarker(googleReference);
      const params = createFakeParams();
      const overlayMouseTarget = {
        appendChild: jest.fn(),
      };

      const marker = new HTMLMarker(params);

      marker.getPanes.mockImplementation(() => ({ overlayMouseTarget }));

      marker.onAdd();

      expect(overlayMouseTarget.appendChild).toHaveBeenCalledWith(
        marker.element
      );
    });

    it('expect to not append the element to the overlay when panes are not available', () => {
      const googleReference = createFakeGoogleReference();
      const HTMLMarker = createHTMLMarker(googleReference);
      const params = createFakeParams();
      const overlayMouseTarget = {
        appendChild: jest.fn(),
      };

      const marker = new HTMLMarker(params);

      marker.getPanes.mockImplementation(() => null);

      marker.onAdd();

      expect(overlayMouseTarget.appendChild).not.toHaveBeenCalled();
    });
  });

  describe('draw', () => {
    it('expect to set the correct position on the element', () => {
      const googleReference = createFakeGoogleReference();
      const HTMLMarker = createHTMLMarker(googleReference);
      const params = createFakeParams();
      const fromLatLngToDivPixel = jest.fn(() => ({
        x: 100,
        y: 50,
      }));

      const marker = new HTMLMarker(params);

      marker.getProjection.mockImplementation(() => ({
        fromLatLngToDivPixel,
      }));

      marker.draw();

      expect(fromLatLngToDivPixel).toHaveBeenCalledWith({ lat: 10, lng: 12 });
      expect(marker.element.style.left).toBe('100px');
      expect(marker.element.style.top).toBe('50px');
    });

    it('expect to set the correct zIndex on the element', () => {
      const googleReference = createFakeGoogleReference();
      const HTMLMarker = createHTMLMarker(googleReference);
      const params = createFakeParams();
      const fromLatLngToDivPixel = jest.fn(() => ({
        x: 100,
        y: 50,
      }));

      const marker = new HTMLMarker(params);

      marker.getProjection.mockImplementationOnce(() => ({
        fromLatLngToDivPixel,
      }));

      marker.draw();

      expect(marker.element.style.zIndex).toBe('0');
    });

    it('expect to not set the correct position when the projection is not available', () => {
      const googleReference = createFakeGoogleReference();
      const HTMLMarker = createHTMLMarker(googleReference);
      const params = createFakeParams();

      const marker = new HTMLMarker(params);

      marker.getProjection.mockImplementation(() => null);

      marker.draw();

      expect(marker.element.style.left).toBe('');
      expect(marker.element.style.top).toBe('');
      expect(marker.element.style.zIndex).toBe('');
    });
  });

  describe('onRemove', () => {
    it('expect to remove the element', () => {
      const googleReference = createFakeGoogleReference();
      const HTMLMarker = createHTMLMarker(googleReference);
      const params = createFakeParams();

      const marker = new HTMLMarker(params);

      // Simulate the parentNode
      const parentNode = document.createElement('div');
      parentNode.appendChild(marker.element);

      expect(parentNode.childNodes).toHaveLength(1);

      marker.onRemove();

      expect(parentNode.childNodes).toHaveLength(0);
      expect(marker.element).toBe(undefined);
    });

    it('expect to remove all the listeners', () => {
      const googleReference = createFakeGoogleReference();
      const HTMLMarker = createHTMLMarker(googleReference);
      const params = createFakeParams();
      const remove = jest.fn();

      const marker = new HTMLMarker(params);

      // Simulate the parentNode
      const parentNode = document.createElement('div');
      parentNode.appendChild(marker.element);

      // Simulate the subscriptions
      marker.subscriptions.push({ remove });
      marker.subscriptions.push({ remove });

      marker.onRemove();

      expect(marker.subscriptions).toEqual([]);
      expect(remove).toHaveBeenCalledTimes(2);
    });
  });

  describe('addListener', () => {
    it('expect to register listener', () => {
      const googleReference = createFakeGoogleReference();
      const HTMLMarker = createHTMLMarker(googleReference);
      const params = createFakeParams();
      const onClick = () => {};

      const marker = new HTMLMarker(params);

      const addEventListener = jest.spyOn(marker.element, 'addEventListener');

      marker.addListener('click', onClick);

      expect(addEventListener).toHaveBeenCalledTimes(1);
      expect(addEventListener).toHaveBeenCalledWith('click', onClick);
      expect(marker.subscriptions).toHaveLength(1);
    });

    it('expect to return a function to remove the listener', () => {
      const googleReference = createFakeGoogleReference();
      const HTMLMarker = createHTMLMarker(googleReference);
      const params = createFakeParams();
      const onClick = () => {};

      const marker = new HTMLMarker(params);

      const removeEventListener = jest.spyOn(
        marker.element,
        'removeEventListener'
      );

      const subscription = marker.addListener('click', onClick);

      subscription.remove();

      expect(removeEventListener).toHaveBeenCalledTimes(1);
      expect(removeEventListener).toHaveBeenCalledWith('click', onClick);
      expect(marker.subscriptions).toHaveLength(0);
    });
  });

  describe('getPosition', () => {
    it('expect to return the latLng', () => {
      const googleReference = createFakeGoogleReference();
      const HTMLMarker = createHTMLMarker(googleReference);
      const params = createFakeParams();

      const marker = new HTMLMarker(params);

      const actual = marker.getPosition();
      const expectation = { lat: 10, lng: 12 };

      expect(actual).toEqual(expectation);
    });
  });
});
