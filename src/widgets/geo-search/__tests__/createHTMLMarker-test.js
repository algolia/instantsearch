import createHTMLMarker from '../createHTMLMarker';

describe('createHTMLMarker', () => {
  class FakeOverlayView {
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

  const createFakeGoogleReference = () => ({
    maps: {
      LatLng: jest.fn(x => x),
      // Required to be a constructor since
      // we extend from it in the Marker class
      OverlayView: FakeOverlayView,
    },
  });

  const createFakeParams = ({ ...rest } = {}) => ({
    __id: 123456789,
    position: {
      lat: 10,
      lng: 12,
    },
    map: 'map-instance-placeholder',
    template: '<div>Hello</div>',
    className: 'ais-geo-search-marker',
    ...rest,
  });

  it('expect to create a marker', () => {
    const googleReference = createFakeGoogleReference();
    const HTMLMarker = createHTMLMarker(googleReference);
    const params = createFakeParams();

    const marker = new HTMLMarker(params);

    expect(marker.__id).toBe(123456789);
    expect(marker.anchor).toEqual({ x: 0, y: 0 });
    expect(marker.listeners).toEqual({});
    expect(marker.latLng).toEqual({ lat: 10, lng: 12 });

    expect(marker.element).toEqual(expect.any(HTMLDivElement));
    expect(marker.element.className).toBe('ais-geo-search-marker');
    expect(marker.element.style.position).toBe('absolute');
    expect(marker.element.innerHTML).toBe('<div>Hello</div>');

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

  describe('onAdd', () => {
    it('expect to append the element to the overlay', () => {
      const googleReference = createFakeGoogleReference();
      const HTMLMarker = createHTMLMarker(googleReference);
      const params = createFakeParams();
      const overlayMouseTarget = {
        appendChild: jest.fn(),
      };

      const marker = new HTMLMarker(params);

      marker.getPanes.mockImplementationOnce(() => ({ overlayMouseTarget }));

      marker.onAdd();

      expect(overlayMouseTarget.appendChild).toHaveBeenCalledWith(
        marker.element
      );
    });

    it('expect to compute the element offset', () => {
      const googleReference = createFakeGoogleReference();
      const HTMLMarker = createHTMLMarker(googleReference);
      const params = createFakeParams();

      const marker = new HTMLMarker(params);

      marker.element.getBoundingClientRect = () => ({
        width: 50,
        height: 30,
      });

      marker.onAdd();

      expect(marker.offset).toEqual({ x: 25, y: 30 });
    });

    it('expect to compute the element offset with an anchor', () => {
      const googleReference = createFakeGoogleReference();
      const HTMLMarker = createHTMLMarker(googleReference);
      const params = createFakeParams({
        anchor: {
          x: 5,
          y: 10,
        },
      });

      const marker = new HTMLMarker(params);

      marker.element.getBoundingClientRect = () => ({
        width: 50,
        height: 30,
      });

      marker.onAdd();

      expect(marker.offset).toEqual({ x: 30, y: 40 });
    });

    it('expect to force the element width from the BBox', () => {
      const googleReference = createFakeGoogleReference();
      const HTMLMarker = createHTMLMarker(googleReference);
      const params = createFakeParams({
        anchor: {
          x: 5,
          y: 10,
        },
      });

      const marker = new HTMLMarker(params);

      marker.element.getBoundingClientRect = () => ({
        width: 50,
      });

      marker.onAdd();

      expect(marker.element.style.width).toBe('50px');
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

      marker.getProjection.mockImplementationOnce(() => ({
        fromLatLngToDivPixel,
      }));

      // Simulate the offset
      marker.offset = {
        x: 50,
        y: 30,
      };

      marker.draw();

      expect(fromLatLngToDivPixel).toHaveBeenCalledWith({ lat: 10, lng: 12 });
      expect(marker.element.style.left).toBe('50px');
      expect(marker.element.style.top).toBe('20px');
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

      // Simulate the offset
      marker.offset = {
        x: 50,
        y: 30,
      };

      marker.draw();

      expect(marker.element.style.zIndex).toBe('20');
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
      const onClick = () => {};
      const onMouseOver = () => {};

      const marker = new HTMLMarker(params);

      const removeEventListener = jest.spyOn(
        marker.element,
        'removeEventListener'
      );

      // Simulate the parentNode
      const parentNode = document.createElement('div');
      parentNode.appendChild(marker.element);

      // Simulate the listeners
      marker.listeners = {
        click: onClick,
        mouseover: onMouseOver,
      };

      marker.onRemove();

      expect(marker.listeners).toBe(undefined);
      expect(removeEventListener).toHaveBeenCalledTimes(2);
      expect(removeEventListener).toHaveBeenCalledWith('click', onClick);
      expect(removeEventListener).toHaveBeenCalledWith(
        'mouseover',
        onMouseOver
      );
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
      expect(marker.listeners).toEqual({ click: onClick });
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
