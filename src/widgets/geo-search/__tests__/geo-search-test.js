import { render } from 'preact';
import algoliasearchHelper from 'algoliasearch-helper';
import createHTMLMarker from '../createHTMLMarker';
import renderer from '../GeoSearchRenderer';
import geoSearch from '../geo-search';
import { createInstantSearch } from '../../../../test/mock/createInstantSearch';

jest.mock('preact', () => {
  const module = jest.requireActual('preact');

  module.render = jest.fn();

  return module;
});

jest.mock('../GeoSearchRenderer', () => {
  const module = jest.requireActual('../GeoSearchRenderer');

  return jest.fn((...args) => module.default(...args));
});

jest.mock('../createHTMLMarker');

describe('GeoSearch', () => {
  const createFakeMapInstance = () => ({
    addListener: jest.fn(),
    getCenter: jest.fn(),
    setCenter: jest.fn(),
    getZoom: jest.fn(),
    setZoom: jest.fn(),
    getBounds: jest.fn(() => ({
      getNorthEast: jest.fn(() => ({
        toJSON: jest.fn(() => ({
          lat: 10,
          lng: 12,
        })),
      })),
      getSouthWest: jest.fn(() => ({
        toJSON: jest.fn(() => ({
          lat: 12,
          lng: 14,
        })),
      })),
    })),
    fitBounds: jest.fn(),
  });

  const createFakeMarkerInstance = () => ({
    setMap: jest.fn(),
    getPosition: jest.fn(),
    addListener: jest.fn(),
  });

  const createFakeGoogleReference = ({
    mapInstance = createFakeMapInstance(),
    markerInstance = createFakeMarkerInstance(),
  } = {}) => ({
    maps: {
      LatLng: jest.fn(),
      LatLngBounds: jest.fn((southWest, northEast) => ({
        northEast,
        southWest,
        extend: jest.fn().mockReturnThis(),
        getNorthEast: jest.fn(() => ({
          toJSON: jest.fn(() => ({
            lat: 10,
            lng: 12,
          })),
        })),
        getSouthWest: jest.fn(() => ({
          toJSON: jest.fn(() => ({
            lat: 12,
            lng: 14,
          })),
        })),
      })),
      Map: jest.fn(() => mapInstance),
      Marker: jest.fn(args => ({
        ...args,
        ...markerInstance,
      })),
      ControlPosition: {
        LEFT_TOP: 'left:top',
      },
      event: {
        addListenerOnce: jest.fn(),
      },
      OverlayView: {
        setMap: jest.fn(),
        getPanes: jest.fn(() => ({
          overlayMouseTarget: {
            appendChild: jest.fn(),
          },
        })),
        getProjection: jest.fn(() => ({
          fromLatLngToDivPixel: jest.fn(() => ({
            x: 0,
            y: 0,
          })),
        })),
      },
    },
  });

  const createContainer = () => document.createElement('div');
  const createFakeInstantSearch = () =>
    createInstantSearch({ templatesConfig: undefined });
  const createFakeHelper = () =>
    algoliasearchHelper(
      {
        search() {
          return Promise.resolve({ results: [{}] });
        },
      },
      'indexName'
    );

  const lastRenderArgs = fn => fn.mock.calls[fn.mock.calls.length - 1][0];
  const lastRenderState = fn => lastRenderArgs(fn).widgetParams.renderState;

  const simulateMapReadyEvent = google => {
    google.maps.event.addListenerOnce.mock.calls[0][2]();
  };

  const simulateEvent = (fn, eventName, event) => {
    fn.addListener.mock.calls.find(call => call.includes(eventName))[1](event);
  };

  beforeEach(() => {
    render.mockClear();
    renderer.mockClear();
  });

  describe('Usage', () => {
    it('throws without render function', () => {
      expect(() => {
        geoSearch({
          container: undefined,
        });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/geo-search/js/"
`);
    });
  });

  it('expect to render', () => {
    const container = createContainer();
    const instantSearchInstance = createFakeInstantSearch();
    const helper = createFakeHelper();
    const googleReference = createFakeGoogleReference();

    const widget = geoSearch({
      googleReference,
      container,
    });

    widget.init({
      instantSearchInstance,
      helper,
      state: helper.state,
    });

    widget.render({
      helper,
      instantSearchInstance,
      results: {
        hits: [],
      },
    });

    const [firstRender] = render.mock.calls;

    expect(container.innerHTML).toMatchSnapshot();
    expect(firstRender[0].props).toMatchSnapshot();
    expect(firstRender[1]).toBe(container.querySelector('.ais-GeoSearch-tree'));
  });

  it('expect to render with custom classNames', () => {
    const container = createContainer();
    const instantSearchInstance = createFakeInstantSearch();
    const helper = createFakeHelper();
    const googleReference = createFakeGoogleReference();

    const widget = geoSearch({
      googleReference,
      container,
      cssClasses: {
        root: 'custom-root',
        map: 'custom-map',
        control: 'custom-control',
        label: 'custom-label',
        selectedLabel: 'custom-label-selected',
        input: 'custom-input',
        redo: 'custom-redo',
        disabledRedo: 'custom-redo-disabled',
        reset: 'custom-reset',
      },
    });

    widget.init({
      helper,
      instantSearchInstance,
      state: helper.state,
    });

    widget.render({
      helper,
      instantSearchInstance,
      results: {
        hits: [],
      },
    });

    const [firstRender] = render.mock.calls;

    expect(container.innerHTML).toMatchSnapshot();
    expect(firstRender[0].props).toMatchSnapshot();
    expect(firstRender[1]).toBe(container.querySelector('.ais-GeoSearch-tree'));
  });

  it('expect to render with custom template', () => {
    const container = createContainer();
    const instantSearchInstance = createFakeInstantSearch();
    const helper = createFakeHelper();
    const googleReference = createFakeGoogleReference();

    const widget = geoSearch({
      googleReference,
      container,
      templates: {
        toggle: 'Search when the map move',
      },
    });

    widget.init({
      helper,
      instantSearchInstance,
      state: helper.state,
    });

    widget.render({
      helper,
      instantSearchInstance,
      results: {
        hits: [],
      },
    });

    const [firstRender] = render.mock.calls;

    expect(firstRender[0].props.templateProps.templates).toEqual({
      HTMLMarker: '<p>Your custom HTML Marker</p>',
      reset: 'Clear the map refinement',
      toggle: 'Search when the map move',
      redo: 'Redo search here',
    });
  });

  it('expect to render the map with default options', () => {
    const container = createContainer();
    const instantSearchInstance = createFakeInstantSearch();
    const helper = createFakeHelper();
    const googleReference = createFakeGoogleReference();

    const widget = geoSearch({
      googleReference,
      container,
    });

    widget.init({
      helper,
      instantSearchInstance,
      state: helper.state,
    });

    expect(googleReference.maps.Map).toHaveBeenCalledWith(expect.anything(), {
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      clickableIcons: false,
      zoomControlOptions: {
        position: 'left:top',
      },
    });
  });

  it('expect to render the map with given options', () => {
    const container = createContainer();
    const instantSearchInstance = createFakeInstantSearch();
    const helper = createFakeHelper();
    const googleReference = createFakeGoogleReference();

    const widget = geoSearch({
      googleReference,
      container,
      mapOptions: {
        otherMapSpecific: 'value',
        clickableIcons: true,
        zoomControlOptions: {
          position: 'right:bottom',
        },
      },
    });

    widget.init({
      helper,
      instantSearchInstance,
      state: helper.state,
    });

    expect(googleReference.maps.Map).toHaveBeenCalledWith(expect.anything(), {
      otherMapSpecific: 'value',
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      clickableIcons: true,
      zoomControlOptions: {
        position: 'right:bottom',
      },
    });
  });

  it('expect to unmount', () => {
    const container = createContainer();
    const instantSearchInstance = createFakeInstantSearch();
    const helper = createFakeHelper();
    const googleReference = createFakeGoogleReference();

    const widget = geoSearch({
      googleReference,
      container,
    });

    widget.init({
      helper,
      instantSearchInstance,
      state: helper.state,
    });

    widget.render({
      helper,
      instantSearchInstance,
      results: {
        hits: [],
      },
    });

    expect(render).toHaveBeenCalledTimes(1);

    widget.dispose({
      helper,
      state: helper.state,
    });

    expect(render).toHaveBeenCalledTimes(2);
    expect(render).toHaveBeenCalledWith(null, container);
  });

  describe('setup events', () => {
    it('expect to listen for "idle" once and trigger the registration of the rest of the listeners', () => {
      const container = createContainer();
      const instantSearchInstance = createFakeInstantSearch();
      const helper = createFakeHelper();
      const mapInstance = createFakeMapInstance();
      const googleReference = createFakeGoogleReference({ mapInstance });

      const widget = geoSearch({
        googleReference,
        container,
      });

      widget.init({
        helper,
        instantSearchInstance,
        state: helper.state,
      });

      expect(googleReference.maps.event.addListenerOnce).toHaveBeenCalledWith(
        mapInstance,
        'idle',
        expect.any(Function)
      );

      simulateMapReadyEvent(googleReference);

      expect(mapInstance.addListener).toHaveBeenCalledWith(
        'center_changed',
        expect.any(Function)
      );

      expect(mapInstance.addListener).toHaveBeenCalledWith(
        'zoom_changed',
        expect.any(Function)
      );

      expect(mapInstance.addListener).toHaveBeenCalledWith(
        'dragstart',
        expect.any(Function)
      );

      expect(mapInstance.addListener).toHaveBeenCalledWith(
        'idle',
        expect.any(Function)
      );
    });

    it('expect to listen for "idle" call refine and reset the scheduler', () => {
      const container = createContainer();
      const instantSearchInstance = createFakeInstantSearch();
      const helper = createFakeHelper();
      const mapInstance = createFakeMapInstance();
      const googleReference = createFakeGoogleReference({ mapInstance });

      // Not the best way to check that refine has been called but I didn't
      // find an other way to do it. But it works.
      helper.search = jest.fn();

      const widget = geoSearch({
        googleReference,
        container,
      });

      widget.init({
        helper,
        instantSearchInstance,
        state: helper.state,
      });

      simulateMapReadyEvent(googleReference);

      expect(mapInstance.addListener).toHaveBeenCalledWith(
        'idle',
        expect.any(Function)
      );

      simulateEvent(mapInstance, 'dragstart');
      simulateEvent(mapInstance, 'idle');

      expect(lastRenderState(renderer).isPendingRefine).toBe(false);
      expect(helper.search).toHaveBeenCalled();
    });

    it('expect to listen for "idle" and do not trigger on programmatic interaction', () => {
      const container = createContainer();
      const instantSearchInstance = createFakeInstantSearch();
      const helper = createFakeHelper();
      const mapInstance = createFakeMapInstance();
      const googleReference = createFakeGoogleReference({ mapInstance });

      // Not the best way to check that refine has been called but I didn't
      // find an other way to do it. But it works.
      helper.search = jest.fn();

      const widget = geoSearch({
        googleReference,
        container,
      });

      widget.init({
        helper,
        instantSearchInstance,
        state: helper.state,
      });

      simulateMapReadyEvent(googleReference);

      expect(mapInstance.addListener).toHaveBeenCalledWith(
        'idle',
        expect.any(Function)
      );

      simulateEvent(mapInstance, 'dragstart');

      // Simulate programmatic event
      lastRenderState(renderer).isUserInteraction = false;

      simulateEvent(mapInstance, 'idle');

      expect(lastRenderState(renderer).isPendingRefine).toBe(true);
      expect(helper.search).not.toHaveBeenCalled();
    });

    it('expect to listen for "idle" and do not trigger when refine is not schedule', () => {
      const container = createContainer();
      const instantSearchInstance = createFakeInstantSearch();
      const helper = createFakeHelper();
      const mapInstance = createFakeMapInstance();
      const googleReference = createFakeGoogleReference({ mapInstance });

      // Not the best way to check that refine has been called but I didn't
      // find an other way to do it. But it works.
      helper.search = jest.fn();

      const widget = geoSearch({
        googleReference,
        container,
      });

      widget.init({
        helper,
        instantSearchInstance,
        state: helper.state,
      });

      simulateMapReadyEvent(googleReference);

      expect(mapInstance.addListener).toHaveBeenCalledWith(
        'idle',
        expect.any(Function)
      );

      simulateEvent(mapInstance, 'idle');

      expect(lastRenderState(renderer).isPendingRefine).toBe(false);
      expect(helper.search).not.toHaveBeenCalled();
    });

    // Use the same tests for all events since all of them trigger the same function
    ['center_changed', 'zoom_changed', 'dragstart'].forEach(eventName => {
      it(`expect to listen for "${eventName}" and trigger setMapMoveSinceLastRefine`, () => {
        const container = createContainer();
        const instantSearchInstance = createFakeInstantSearch();
        const helper = createFakeHelper();
        const mapInstance = createFakeMapInstance();
        const googleReference = createFakeGoogleReference({ mapInstance });

        const widget = geoSearch({
          googleReference,
          container,
        });

        widget.init({
          helper,
          instantSearchInstance,
          state: helper.state,
        });

        simulateMapReadyEvent(googleReference);

        expect(mapInstance.addListener).toHaveBeenCalledWith(
          eventName,
          expect.any(Function)
        );

        widget.render({
          helper,
          instantSearchInstance,
          results: {
            hits: [],
          },
        });

        expect(lastRenderArgs(renderer).hasMapMoveSinceLastRefine()).toBe(
          false
        );

        simulateEvent(mapInstance, eventName);

        expect(lastRenderArgs(renderer).hasMapMoveSinceLastRefine()).toBe(true);
      });

      it(`expect to listen for "${eventName}" and schedule a refine call`, () => {
        const container = createContainer();
        const instantSearchInstance = createFakeInstantSearch();
        const helper = createFakeHelper();
        const mapInstance = createFakeMapInstance();
        const googleReference = createFakeGoogleReference({ mapInstance });

        const widget = geoSearch({
          googleReference,
          container,
        });

        widget.init({
          helper,
          instantSearchInstance,
          state: helper.state,
        });

        simulateMapReadyEvent(googleReference);

        expect(mapInstance.addListener).toHaveBeenCalledWith(
          eventName,
          expect.any(Function)
        );

        widget.render({
          helper,
          instantSearchInstance,
          results: {
            hits: [],
          },
        });

        expect(lastRenderState(renderer).isPendingRefine).toBe(false);

        simulateEvent(mapInstance, eventName);

        expect(lastRenderState(renderer).isPendingRefine).toBe(true);
      });

      it(`expect to listen for "${eventName}" and not schedule a refine call when refine on map move is disabled`, () => {
        const container = createContainer();
        const instantSearchInstance = createFakeInstantSearch();
        const helper = createFakeHelper();
        const mapInstance = createFakeMapInstance();
        const googleReference = createFakeGoogleReference({ mapInstance });

        const widget = geoSearch({
          googleReference,
          container,
          enableRefineOnMapMove: false,
        });

        widget.init({
          helper,
          instantSearchInstance,
          state: helper.state,
        });

        simulateMapReadyEvent(googleReference);

        expect(mapInstance.addListener).toHaveBeenCalledWith(
          eventName,
          expect.any(Function)
        );

        widget.render({
          helper,
          instantSearchInstance,
          results: {
            hits: [],
          },
        });

        expect(lastRenderState(renderer).isPendingRefine).toBe(false);

        simulateEvent(mapInstance, eventName);

        expect(lastRenderState(renderer).isPendingRefine).toBe(false);
      });

      it(`expect to listen for "${eventName}" and do not trigger on programmatic interaction`, () => {
        const container = createContainer();
        const instantSearchInstance = createFakeInstantSearch();
        const helper = createFakeHelper();
        const mapInstance = createFakeMapInstance();
        const googleReference = createFakeGoogleReference({ mapInstance });

        const widget = geoSearch({
          googleReference,
          container,
        });

        widget.init({
          helper,
          instantSearchInstance,
          state: helper.state,
        });

        simulateMapReadyEvent(googleReference);

        expect(mapInstance.addListener).toHaveBeenCalledWith(
          eventName,
          expect.any(Function)
        );

        // Simulate programmatic event
        lastRenderState(renderer).isUserInteraction = false;

        expect(lastRenderArgs(renderer).hasMapMoveSinceLastRefine()).toBe(
          false
        );
        expect(lastRenderState(renderer).isPendingRefine).toBe(false);

        simulateEvent(mapInstance, eventName);

        expect(lastRenderArgs(renderer).hasMapMoveSinceLastRefine()).toBe(
          false
        );
        expect(lastRenderState(renderer).isPendingRefine).toBe(false);
      });

      it(`expect to listen for "${eventName}" and do not trigger when refine is disabled`, () => {
        const container = createContainer();
        const instantSearchInstance = createFakeInstantSearch();
        const helper = createFakeHelper();
        const mapInstance = createFakeMapInstance();
        const googleReference = createFakeGoogleReference({ mapInstance });

        const widget = geoSearch({
          googleReference,
          container,
          enableRefine: false,
        });

        widget.init({
          helper,
          instantSearchInstance,
          state: helper.state,
        });

        simulateMapReadyEvent(googleReference);

        expect(mapInstance.addListener).toHaveBeenCalledWith(
          eventName,
          expect.any(Function)
        );

        expect(lastRenderArgs(renderer).hasMapMoveSinceLastRefine()).toBe(
          false
        );
        expect(lastRenderState(renderer).isPendingRefine).toBe(false);

        simulateEvent(mapInstance, eventName);

        expect(lastRenderArgs(renderer).hasMapMoveSinceLastRefine()).toBe(
          false
        );
        expect(lastRenderState(renderer).isPendingRefine).toBe(false);
      });
    });
  });

  describe('markers creation', () => {
    it('expect to render built-in markers with default options', () => {
      const container = createContainer();
      const instantSearchInstance = createFakeInstantSearch();
      const helper = createFakeHelper();
      const googleReference = createFakeGoogleReference();

      const widget = geoSearch({
        googleReference,
        container,
      });

      widget.init({
        helper,
        instantSearchInstance,
        state: helper.state,
      });

      widget.render({
        helper,
        instantSearchInstance,
        results: {
          hits: [
            { objectID: 123, _geoloc: true },
            { objectID: 456, _geoloc: true },
            { objectID: 789, _geoloc: true },
          ],
        },
      });

      expect(googleReference.maps.Marker).toHaveBeenCalledTimes(3);
      expect(googleReference.maps.Marker.mock.calls).toEqual([
        [expect.objectContaining({ __id: 123 })],
        [expect.objectContaining({ __id: 456 })],
        [expect.objectContaining({ __id: 789 })],
      ]);
    });

    it('expect to render built-in markers with given options', () => {
      const container = createContainer();
      const instantSearchInstance = createFakeInstantSearch();
      const helper = createFakeHelper();
      const googleReference = createFakeGoogleReference();

      const widget = geoSearch({
        googleReference,
        container,
        builtInMarker: {
          createOptions: item => ({
            title: `ID: ${item.objectID}`,
          }),
        },
      });

      widget.init({
        helper,
        instantSearchInstance,
        state: helper.state,
      });

      widget.render({
        helper,
        instantSearchInstance,
        results: {
          hits: [
            { objectID: 123, _geoloc: true },
            { objectID: 456, _geoloc: true },
            { objectID: 789, _geoloc: true },
          ],
        },
      });

      expect(googleReference.maps.Marker).toHaveBeenCalledTimes(3);
      expect(googleReference.maps.Marker.mock.calls).toEqual([
        [expect.objectContaining({ __id: 123, title: 'ID: 123' })],
        [expect.objectContaining({ __id: 456, title: 'ID: 456' })],
        [expect.objectContaining({ __id: 789, title: 'ID: 789' })],
      ]);
    });

    it('expect to setup listeners on built-in markers', () => {
      const container = createContainer();
      const instantSearchInstance = createFakeInstantSearch();
      const helper = createFakeHelper();
      const mapInstance = createFakeMapInstance();
      const markerInstance = createFakeMarkerInstance();
      const googleReference = createFakeGoogleReference({
        mapInstance,
        markerInstance,
      });

      const onClick = jest.fn();
      const onMouseOver = jest.fn();

      const widget = geoSearch({
        googleReference,
        container,
        builtInMarker: {
          events: {
            click: onClick,
            mouseover: onMouseOver,
          },
        },
      });

      widget.init({
        helper,
        instantSearchInstance,
        state: helper.state,
      });

      widget.render({
        helper,
        instantSearchInstance,
        results: {
          hits: [
            { objectID: 123, _geoloc: true },
            { objectID: 234, _geoloc: true },
            { objectID: 789, _geoloc: true },
          ],
        },
      });

      // 2 events for each hit
      expect(markerInstance.addListener).toHaveBeenCalledTimes(6);

      // Simulate click event
      simulateEvent(markerInstance, 'click', { type: 'click' });

      // Simulate mouseover event
      simulateEvent(markerInstance, 'mouseover', { type: 'mouseover' });

      expect(onClick).toHaveBeenCalledWith({
        event: { type: 'click' },
        item: { objectID: 123, _geoloc: true },
        marker: expect.objectContaining({ __id: 123 }),
        map: mapInstance,
      });

      expect(onMouseOver).toHaveBeenCalledWith({
        event: { type: 'mouseover' },
        item: { objectID: 123, _geoloc: true },
        marker: expect.objectContaining({ __id: 123 }),
        map: mapInstance,
      });
    });

    it('expect to render custom HTML markers with default options', () => {
      const container = createContainer();
      const instantSearchInstance = createFakeInstantSearch();
      const helper = createFakeHelper();
      const googleReference = createFakeGoogleReference();
      const HTMLMarker = jest.fn(createFakeMarkerInstance);

      createHTMLMarker.mockImplementation(() => HTMLMarker);

      const widget = geoSearch({
        googleReference,
        container,
        customHTMLMarker: true,
      });

      widget.init({
        helper,
        instantSearchInstance,
        state: helper.state,
      });

      widget.render({
        helper,
        instantSearchInstance,
        results: {
          hits: [
            { objectID: 123, _geoloc: true },
            { objectID: 456, _geoloc: true },
            { objectID: 789, _geoloc: true },
          ],
        },
      });

      expect(HTMLMarker).toHaveBeenCalledTimes(3);
      expect(HTMLMarker.mock.calls).toEqual([
        [
          expect.objectContaining({
            __id: 123,
            template: '<p>Your custom HTML Marker</p>',
          }),
        ],
        [
          expect.objectContaining({
            __id: 456,
            template: '<p>Your custom HTML Marker</p>',
          }),
        ],
        [
          expect.objectContaining({
            __id: 789,
            template: '<p>Your custom HTML Marker</p>',
          }),
        ],
      ]);

      createHTMLMarker.mockRestore();
    });

    it('expect to render custom HTML markers with given options', () => {
      const container = createContainer();
      const instantSearchInstance = createFakeInstantSearch();
      const helper = createFakeHelper();
      const googleReference = createFakeGoogleReference();
      const HTMLMarker = jest.fn(createFakeMarkerInstance);

      createHTMLMarker.mockImplementation(() => HTMLMarker);

      const widget = geoSearch({
        googleReference,
        container,
        customHTMLMarker: {
          createOptions: item => ({
            title: `ID: ${item.objectID}`,
          }),
        },
        templates: {
          HTMLMarker: '<p>{{objectID}}</p>',
        },
      });

      widget.init({
        helper,
        instantSearchInstance,
        state: helper.state,
      });

      widget.render({
        helper,
        instantSearchInstance,
        results: {
          hits: [
            { objectID: 123, _geoloc: true },
            { objectID: 456, _geoloc: true },
            { objectID: 789, _geoloc: true },
          ],
        },
      });

      expect(HTMLMarker).toHaveBeenCalledTimes(3);
      expect(HTMLMarker.mock.calls).toEqual([
        [
          expect.objectContaining({
            __id: 123,
            title: 'ID: 123',
            template: '<p>123</p>',
          }),
        ],
        [
          expect.objectContaining({
            __id: 456,
            title: 'ID: 456',
            template: '<p>456</p>',
          }),
        ],
        [
          expect.objectContaining({
            __id: 789,
            title: 'ID: 789',
            template: '<p>789</p>',
          }),
        ],
      ]);

      createHTMLMarker.mockRestore();
    });

    it('expect to render custom HTML markers with only the template provided', () => {
      const container = createContainer();
      const instantSearchInstance = createFakeInstantSearch();
      const helper = createFakeHelper();
      const googleReference = createFakeGoogleReference();
      const HTMLMarker = jest.fn(createFakeMarkerInstance);

      createHTMLMarker.mockImplementation(() => HTMLMarker);

      const widget = geoSearch({
        googleReference,
        container,
        templates: {
          HTMLMarker: '<p>{{objectID}}</p>',
        },
      });

      widget.init({
        helper,
        instantSearchInstance,
        state: helper.state,
      });

      widget.render({
        helper,
        instantSearchInstance,
        results: {
          hits: [
            { objectID: 123, _geoloc: true },
            { objectID: 456, _geoloc: true },
            { objectID: 789, _geoloc: true },
          ],
        },
      });

      expect(HTMLMarker).toHaveBeenCalledTimes(3);
      expect(HTMLMarker.mock.calls).toEqual([
        [
          expect.objectContaining({
            __id: 123,
            template: '<p>123</p>',
          }),
        ],
        [
          expect.objectContaining({
            __id: 456,
            template: '<p>456</p>',
          }),
        ],
        [
          expect.objectContaining({
            __id: 789,
            template: '<p>789</p>',
          }),
        ],
      ]);

      createHTMLMarker.mockRestore();
    });

    it('expect to render custom HTML markers with only the object provided', () => {
      const container = createContainer();
      const instantSearchInstance = createFakeInstantSearch();
      const helper = createFakeHelper();
      const googleReference = createFakeGoogleReference();
      const HTMLMarker = jest.fn(createFakeMarkerInstance);

      createHTMLMarker.mockImplementation(() => HTMLMarker);

      const widget = geoSearch({
        googleReference,
        container,
        customHTMLMarker: {
          createOptions: item => ({
            title: `ID: ${item.objectID}`,
          }),
        },
      });

      widget.init({
        helper,
        instantSearchInstance,
        state: helper.state,
      });

      widget.render({
        helper,
        instantSearchInstance,
        results: {
          hits: [
            { objectID: 123, _geoloc: true },
            { objectID: 456, _geoloc: true },
            { objectID: 789, _geoloc: true },
          ],
        },
      });

      expect(HTMLMarker).toHaveBeenCalledTimes(3);
      expect(HTMLMarker.mock.calls).toEqual([
        [
          expect.objectContaining({
            __id: 123,
            title: 'ID: 123',
            template: '<p>Your custom HTML Marker</p>',
          }),
        ],
        [
          expect.objectContaining({
            __id: 456,
            title: 'ID: 456',
            template: '<p>Your custom HTML Marker</p>',
          }),
        ],
        [
          expect.objectContaining({
            __id: 789,
            title: 'ID: 789',
            template: '<p>Your custom HTML Marker</p>',
          }),
        ],
      ]);

      createHTMLMarker.mockRestore();
    });

    it('expect to setup listeners on custom HTML markers', () => {
      const container = createContainer();
      const instantSearchInstance = createFakeInstantSearch();
      const helper = createFakeHelper();
      const mapInstance = createFakeMapInstance();
      const googleReference = createFakeGoogleReference({ mapInstance });
      const markerInstance = createFakeMarkerInstance();
      const HTMLMarker = jest.fn(({ ...args }) => ({
        ...args,
        ...markerInstance,
      }));

      const onClick = jest.fn();
      const onMouseOver = jest.fn();

      createHTMLMarker.mockImplementation(() => HTMLMarker);

      const widget = geoSearch({
        googleReference,
        container,
        customHTMLMarker: {
          events: {
            click: onClick,
            mouseover: onMouseOver,
          },
        },
      });

      widget.init({
        helper,
        instantSearchInstance,
        state: helper.state,
      });

      widget.render({
        helper,
        instantSearchInstance,
        results: {
          hits: [
            { objectID: 123, _geoloc: true },
            { objectID: 234, _geoloc: true },
            { objectID: 789, _geoloc: true },
          ],
        },
      });

      // 2 events for each hit
      expect(markerInstance.addListener).toHaveBeenCalledTimes(6);

      // Simulate click event
      simulateEvent(markerInstance, 'click', { type: 'click' });

      // Simulate mouseover event
      simulateEvent(markerInstance, 'mouseover', { type: 'mouseover' });

      expect(onClick).toHaveBeenCalledWith({
        event: { type: 'click' },
        item: { objectID: 123, _geoloc: true },
        marker: expect.objectContaining({ __id: 123 }),
        map: mapInstance,
      });

      expect(onMouseOver).toHaveBeenCalledWith({
        event: { type: 'mouseover' },
        item: { objectID: 123, _geoloc: true },
        marker: expect.objectContaining({ __id: 123 }),
        map: mapInstance,
      });

      createHTMLMarker.mockRestore();
    });
  });

  describe('markers lifecycle', () => {
    it('expect to append all new markers on the map', () => {
      const container = createContainer();
      const instantSearchInstance = createFakeInstantSearch();
      const helper = createFakeHelper();
      const markerInstance = createFakeMarkerInstance();
      const googleReference = createFakeGoogleReference({ markerInstance });

      const widget = geoSearch({
        googleReference,
        container,
      });

      widget.init({
        helper,
        instantSearchInstance,
        state: helper.state,
      });

      widget.render({
        helper,
        instantSearchInstance,
        results: {
          hits: [
            { objectID: 123, _geoloc: true },
            { objectID: 456, _geoloc: true },
            { objectID: 789, _geoloc: true },
          ],
        },
      });

      expect(markerInstance.setMap).not.toHaveBeenCalled();
      expect(googleReference.maps.Marker).toHaveBeenCalledTimes(3);
      expect(lastRenderState(renderer).markers).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ __id: 123 }),
          expect.objectContaining({ __id: 456 }),
          expect.objectContaining({ __id: 789 }),
        ])
      );
    });

    it('expect to not append anything when the items are empty', () => {
      const container = createContainer();
      const instantSearchInstance = createFakeInstantSearch();
      const helper = createFakeHelper();
      const markerInstance = createFakeMarkerInstance();
      const googleReference = createFakeGoogleReference({ markerInstance });

      const widget = geoSearch({
        googleReference,
        container,
      });

      widget.init({
        helper,
        instantSearchInstance,
        state: helper.state,
      });

      widget.render({
        helper,
        instantSearchInstance,
        results: {
          hits: [],
        },
      });

      expect(markerInstance.setMap).not.toHaveBeenCalled();
      expect(googleReference.maps.Marker).toHaveBeenCalledTimes(0);
      expect(lastRenderState(renderer).markers).toEqual([]);
    });

    it('expect to append only new markers on the map on the next render', () => {
      const container = createContainer();
      const instantSearchInstance = createFakeInstantSearch();
      const helper = createFakeHelper();
      const markerInstance = createFakeMarkerInstance();
      const googleReference = createFakeGoogleReference({ markerInstance });

      const widget = geoSearch({
        googleReference,
        container,
      });

      widget.init({
        helper,
        instantSearchInstance,
        state: helper.state,
      });

      widget.render({
        helper,
        instantSearchInstance,
        results: {
          hits: [
            { objectID: 123, _geoloc: true },
            { objectID: 456, _geoloc: true },
            { objectID: 789, _geoloc: true },
          ],
        },
      });

      googleReference.maps.Marker.mockClear();

      widget.render({
        helper,
        instantSearchInstance,
        results: {
          hits: [
            { objectID: 123, _geoloc: true },
            { objectID: 456, _geoloc: true },
            { objectID: 789, _geoloc: true },
            { objectID: 101, _geoloc: true },
          ],
        },
      });

      expect(markerInstance.setMap).not.toHaveBeenCalled();
      expect(googleReference.maps.Marker).toHaveBeenCalledTimes(1);
      expect(lastRenderState(renderer).markers).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ __id: 123 }),
          expect.objectContaining({ __id: 456 }),
          expect.objectContaining({ __id: 789 }),
          expect.objectContaining({ __id: 101 }),
        ])
      );
    });

    it('expect to remove only old markers on the map on the next render', () => {
      const container = createContainer();
      const instantSearchInstance = createFakeInstantSearch();
      const helper = createFakeHelper();
      const markerInstance = createFakeMarkerInstance();
      const googleReference = createFakeGoogleReference({ markerInstance });

      const widget = geoSearch({
        googleReference,
        container,
      });

      widget.init({
        helper,
        instantSearchInstance,
        state: helper.state,
      });

      widget.render({
        helper,
        instantSearchInstance,
        results: {
          hits: [
            { objectID: 123, _geoloc: true },
            { objectID: 456, _geoloc: true },
            { objectID: 789, _geoloc: true },
          ],
        },
      });

      googleReference.maps.Marker.mockClear();

      widget.render({
        helper,
        instantSearchInstance,
        results: {
          hits: [{ objectID: 123, _geoloc: true }],
        },
      });

      expect(googleReference.maps.Marker).not.toHaveBeenCalled();
      expect(markerInstance.setMap).toHaveBeenCalledTimes(2);
      expect(lastRenderState(renderer).markers).toEqual(
        expect.arrayContaining([expect.objectContaining({ __id: 123 })])
      );
    });
  });

  describe('update map position', () => {
    it('expect to update the map position from the markers boundingBox', () => {
      const container = createContainer();
      const instantSearchInstance = createFakeInstantSearch();
      const helper = createFakeHelper();
      const mapInstance = createFakeMapInstance();
      const googleReference = createFakeGoogleReference({ mapInstance });

      const widget = geoSearch({
        googleReference,
        container,
      });

      widget.init({
        helper,
        instantSearchInstance,
        state: helper.state,
      });

      widget.render({
        helper,
        instantSearchInstance,
        results: {
          hits: [{ objectID: 123, _geoloc: true }],
        },
      });

      expect(mapInstance.fitBounds).toHaveBeenCalledTimes(1);
      expect(mapInstance.fitBounds).toHaveBeenLastCalledWith(
        expect.objectContaining({
          northEast: { lat: 10, lng: 12 },
          southWest: { lat: 12, lng: 14 },
        }),
        null
      );
      expect(renderer).toHaveBeenCalledTimes(2);

      widget.render({
        helper,
        instantSearchInstance,
        results: {
          hits: [
            { objectID: 123, _geoloc: true },
            { objectID: 456, _geoloc: true },
          ],
        },
      });

      expect(mapInstance.fitBounds).toHaveBeenCalledTimes(2);
      expect(mapInstance.fitBounds).toHaveBeenLastCalledWith(
        expect.objectContaining({
          northEast: { lat: 10, lng: 12 },
          southWest: { lat: 12, lng: 14 },
        }),
        null
      );
      expect(renderer).toHaveBeenCalledTimes(3);
    });

    it('expect to update the map position from the current refinement boundingBox', () => {
      const container = createContainer();
      const instantSearchInstance = createFakeInstantSearch();
      const helper = createFakeHelper();
      const mapInstance = createFakeMapInstance();
      const googleReference = createFakeGoogleReference({ mapInstance });

      mapInstance.getBounds.mockImplementation(() => ({
        getNorthEast: jest.fn(() => ({
          toJSON: jest.fn(() => ({
            lat: 12,
            lng: 14,
          })),
        })),
        getSouthWest: jest.fn(() => ({
          toJSON: jest.fn(() => ({
            lat: 14,
            lng: 16,
          })),
        })),
      }));

      const widget = geoSearch({
        googleReference,
        container,
      });

      widget.init({
        helper,
        instantSearchInstance,
        state: helper.state,
      });

      simulateMapReadyEvent(googleReference);

      widget.render({
        helper,
        instantSearchInstance,
        results: {
          hits: [{ objectID: 123, _geoloc: true }],
        },
      });

      expect(lastRenderArgs(renderer).hasMapMoveSinceLastRefine()).toBe(false);
      expect(lastRenderArgs(renderer).isRefinedWithMap()).toBe(false);
      expect(mapInstance.fitBounds).toHaveBeenCalledTimes(1);
      expect(mapInstance.fitBounds).toHaveBeenLastCalledWith(
        expect.objectContaining({
          northEast: { lat: 10, lng: 12 },
          southWest: { lat: 12, lng: 14 },
        }),
        null
      );
      expect(renderer).toHaveBeenCalledTimes(2);

      // Simulate user interactions
      simulateEvent(mapInstance, 'dragstart');
      simulateEvent(mapInstance, 'center_changed');

      expect(lastRenderArgs(renderer).isRefinedWithMap()).toBe(false);
      expect(mapInstance.fitBounds).toHaveBeenCalledTimes(1);
      expect(mapInstance.fitBounds).toHaveBeenLastCalledWith(
        expect.objectContaining({
          northEast: { lat: 10, lng: 12 },
          southWest: { lat: 12, lng: 14 },
        }),
        null
      );
      expect(renderer).toHaveBeenCalledTimes(3);

      // Simulate refine
      simulateEvent(mapInstance, 'idle');

      widget.render({
        helper,
        instantSearchInstance,
        results: {
          hits: [
            { objectID: 123, _geoloc: true },
            { objectID: 456, _geoloc: true },
          ],
        },
      });

      expect(lastRenderArgs(renderer).isRefinedWithMap()).toBe(true);
      expect(mapInstance.fitBounds).toHaveBeenCalledTimes(2);
      expect(mapInstance.fitBounds).toHaveBeenLastCalledWith(
        expect.objectContaining({
          northEast: { lat: 12, lng: 14 },
          southWest: { lat: 14, lng: 16 },
        }),
        0
      );
      expect(renderer).toHaveBeenCalledTimes(4);
    });

    it('expect to update the map position from the initial current refinement boundingBox', () => {
      const container = createContainer();
      const instantSearchInstance = createFakeInstantSearch();
      const helper = createFakeHelper();
      const mapInstance = createFakeMapInstance();
      const googleReference = createFakeGoogleReference({ mapInstance });

      // Simulate the current refinement
      helper.setQueryParameter(
        'insideBoundingBox',
        '48.84174222399724, 2.367719162523599, 48.81614630305218, 2.284205902635904'
      );

      const widget = geoSearch({
        googleReference,
        container,
      });

      widget.init({
        helper,
        instantSearchInstance,
        state: helper.state,
      });

      widget.render({
        helper,
        instantSearchInstance,
        results: {
          hits: [{ objectID: 123, _geoloc: true }],
        },
      });

      expect(lastRenderArgs(renderer).isRefinedWithMap()).toBe(true);
      expect(mapInstance.fitBounds).toHaveBeenCalledTimes(1);
      expect(mapInstance.fitBounds).toHaveBeenLastCalledWith(
        expect.objectContaining({
          northEast: { lat: 48.84174222399724, lng: 2.367719162523599 },
          southWest: { lat: 48.81614630305218, lng: 2.284205902635904 },
        }),
        0
      );
      expect(renderer).toHaveBeenCalledTimes(2);

      widget.render({
        helper,
        instantSearchInstance,
        results: {
          hits: [
            { objectID: 123, _geoloc: true },
            { objectID: 456, _geoloc: true },
          ],
        },
      });

      expect(lastRenderArgs(renderer).isRefinedWithMap()).toBe(true);
      expect(mapInstance.fitBounds).toHaveBeenCalledTimes(2);
      expect(mapInstance.fitBounds).toHaveBeenLastCalledWith(
        expect.objectContaining({
          northEast: { lat: 48.84174222399724, lng: 2.367719162523599 },
          southWest: { lat: 48.81614630305218, lng: 2.284205902635904 },
        }),
        0
      );
      expect(renderer).toHaveBeenCalledTimes(3);
    });

    it('expect to update the map position from the initial position & zoom without a boundingBox', () => {
      const container = createContainer();
      const instantSearchInstance = createFakeInstantSearch();
      const helper = createFakeHelper();
      const mapInstance = createFakeMapInstance();
      const googleReference = createFakeGoogleReference({ mapInstance });

      const widget = geoSearch({
        googleReference,
        container,
      });

      widget.init({
        helper,
        instantSearchInstance,
        state: helper.state,
      });

      widget.render({
        helper,
        instantSearchInstance,
        results: {
          hits: [{ objectID: 123, _geoloc: true }],
        },
      });

      expect(mapInstance.fitBounds).toHaveBeenCalledTimes(1);
      expect(mapInstance.setZoom).toHaveBeenCalledTimes(0);
      expect(mapInstance.setCenter).toHaveBeenCalledTimes(0);

      expect(renderer).toHaveBeenCalledTimes(2);

      widget.render({
        helper,
        instantSearchInstance,
        results: {
          hits: [],
        },
      });

      expect(mapInstance.fitBounds).toHaveBeenCalledTimes(1);

      expect(mapInstance.setZoom).toHaveBeenCalledTimes(1);
      expect(mapInstance.setZoom).toHaveBeenLastCalledWith(1);

      expect(mapInstance.setCenter).toHaveBeenCalledTimes(1);
      expect(mapInstance.setCenter).toHaveBeenLastCalledWith({
        lat: 0,
        lng: 0,
      });

      expect(renderer).toHaveBeenCalledTimes(3);
    });

    it('expect to update the map position from the position & zoom without a boundingBox', () => {
      const container = createContainer();
      const instantSearchInstance = createFakeInstantSearch();
      const helper = createFakeHelper();
      const mapInstance = createFakeMapInstance();
      const googleReference = createFakeGoogleReference({ mapInstance });

      // Simulate the position
      helper.setQueryParameter('aroundLatLng', '10, 12');

      const widget = geoSearch({
        googleReference,
        container,
      });

      widget.init({
        helper,
        instantSearchInstance,
        state: helper.state,
      });

      widget.render({
        helper,
        instantSearchInstance,
        results: {
          hits: [{ objectID: 123, _geoloc: true }],
        },
      });

      expect(mapInstance.fitBounds).toHaveBeenCalledTimes(1);
      expect(mapInstance.setZoom).toHaveBeenCalledTimes(0);
      expect(mapInstance.setCenter).toHaveBeenCalledTimes(0);
      expect(renderer).toHaveBeenCalledTimes(2);

      widget.render({
        helper,
        instantSearchInstance,
        results: {
          hits: [],
        },
      });

      expect(mapInstance.fitBounds).toHaveBeenCalledTimes(1);

      expect(mapInstance.setZoom).toHaveBeenCalledTimes(1);
      expect(mapInstance.setZoom).toHaveBeenLastCalledWith(1);

      expect(mapInstance.setCenter).toHaveBeenCalledTimes(1);
      expect(mapInstance.setCenter).toHaveBeenLastCalledWith({
        lat: 10,
        lng: 12,
      });

      expect(renderer).toHaveBeenCalledTimes(3);
    });

    it('expect to not update the map when it has moved since last refine', () => {
      const container = createContainer();
      const instantSearchInstance = createFakeInstantSearch();
      const helper = createFakeHelper();
      const mapInstance = createFakeMapInstance();
      const googleReference = createFakeGoogleReference({ mapInstance });

      const widget = geoSearch({
        googleReference,
        container,
      });

      widget.init({
        helper,
        instantSearchInstance,
        state: helper.state,
      });

      simulateMapReadyEvent(googleReference);

      widget.render({
        helper,
        instantSearchInstance,
        results: {
          hits: [{ objectID: 123, _geoloc: true }],
        },
      });

      expect(lastRenderArgs(renderer).hasMapMoveSinceLastRefine()).toBe(false);
      expect(mapInstance.fitBounds).toHaveBeenCalledTimes(1);
      expect(mapInstance.setZoom).not.toHaveBeenCalled();
      expect(mapInstance.setCenter).not.toHaveBeenCalled();
      expect(renderer).toHaveBeenCalledTimes(2);

      // Simulate user interaction
      simulateEvent(mapInstance, 'dragstart');
      simulateEvent(mapInstance, 'center_changed');

      expect(lastRenderArgs(renderer).hasMapMoveSinceLastRefine()).toBe(true);
      expect(mapInstance.fitBounds).toHaveBeenCalledTimes(1);
      expect(mapInstance.setZoom).not.toHaveBeenCalled();
      expect(mapInstance.setCenter).not.toHaveBeenCalled();
      expect(renderer).toHaveBeenCalledTimes(3);
    });
  });
});
