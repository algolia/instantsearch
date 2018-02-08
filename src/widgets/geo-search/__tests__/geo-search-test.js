import last from 'lodash/last';
import { render } from 'preact-compat';
import algoliasearchHelper from 'algoliasearch-helper';
import createHTMLMarker from '../createHTMLMarker';
import renderer from '../GeoSearchRenderer';
import geoSearch from '../geo-search';

jest.mock('preact-compat', () => {
  const module = require.requireActual('preact-compat');

  module.render = jest.fn();

  return module;
});

jest.mock('../GeoSearchRenderer', () => {
  const module = require.requireActual('../GeoSearchRenderer');

  return jest.fn((...args) => module.default(...args));
});

jest.mock('../createHTMLMarker');

describe('GeoSearchRenderer', () => {
  const createFakeMapInstance = () => ({
    addListener: jest.fn(),
    setCenter: jest.fn(),
    setZoom: jest.fn(),
    getBounds: jest.fn(() => ({
      getNorthEast: jest.fn(),
      getSouthWest: jest.fn(),
    })),
    getZoom: jest.fn(),
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

  const createFakeMarkerInstance = () => ({
    setMap: jest.fn(),
    getPosition: jest.fn(),
    addListener: jest.fn(),
  });

  const createFakeGoogleReference = (
    {
      mapInstance = createFakeMapInstance(),
      markerInstance = createFakeMarkerInstance(),
    } = {}
  ) => ({
    maps: {
      LatLng: jest.fn(),
      LatLngBounds: jest.fn(() => ({
        extend: jest.fn().mockReturnThis(),
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
        addListener: jest.fn(),
        removeListener: jest.fn(),
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
  const createFakeInstantSearch = () => ({ templatesConfig: undefined });
  const createFakeHelper = () =>
    algoliasearchHelper(
      {
        search() {},
        addAlgoliaAgent() {
          return {};
        },
      },
      'indexName'
    );

  const lastOptions = fn => last(fn.mock.calls)[0];
  const lastRenderState = fn => lastOptions(fn).widgetParams.renderState;
  const simulateEvent = (fn, eventName, event) => {
    fn.addListener.mock.calls.find(call => call.includes(eventName))[1](event);
  };

  beforeEach(() => {
    render.mockClear();
    renderer.mockClear();
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

    expect(container.innerHTML).toMatchSnapshot();
    expect(render.mock.calls[0]).toMatchSnapshot();
  });

  it('exepct to render with custom classNames', () => {
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
        controls: 'custom-controls',
        clear: 'custom-clear',
        control: 'custom-control',
        toggleLabel: 'custom-toggleLabel',
        toggleInput: 'custom-toggleInput',
        redo: 'custom-redo',
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

    expect(container.innerHTML).toMatchSnapshot();
    expect(render.mock.calls[0]).toMatchSnapshot();
  });

  it('exepct to render with custom template', () => {
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

    const actual = renderer.mock.calls[0][0].widgetParams.templates;

    const expectation = {
      clear: 'Clear the map refinement',
      toggle: 'Search when the map move',
      redo: 'Redo search here',
    };

    expect(actual).toEqual(expectation);
  });

  it('exepct to render with custom paddingBoundingBoc', () => {
    const container = createContainer();
    const instantSearchInstance = createFakeInstantSearch();
    const helper = createFakeHelper();
    const googleReference = createFakeGoogleReference();

    const widget = geoSearch({
      googleReference,
      container,
      paddingBoundingBox: {
        top: 10,
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

    const actual = renderer.mock.calls[0][0].widgetParams.paddingBoundingBox;

    const expectation = {
      top: 10,
      right: 0,
      bottom: 0,
      left: 0,
    };

    expect(actual).toEqual(expectation);
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

  describe('setup events', () => {
    it('expect to listen for "center_changed" and trigger setMapMoveSinceLastRefine on user interaction', () => {
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

      expect(mapInstance.addListener).toHaveBeenCalledWith(
        'center_changed',
        expect.any(Function)
      );

      widget.render({
        helper,
        instantSearchInstance,
        results: {
          hits: [],
        },
      });

      expect(lastOptions(renderer).hasMapMoveSinceLastRefine()).toBe(false);

      simulateEvent(mapInstance, 'center_changed');

      expect(lastOptions(renderer).hasMapMoveSinceLastRefine()).toBe(true);
    });

    it('expect to listen for "center_changed" and do not trigger on programmatic interaction', () => {
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

      expect(mapInstance.addListener).toHaveBeenCalledWith(
        'center_changed',
        expect.any(Function)
      );

      // Simulate programmatic event
      lastRenderState(renderer).isUserInteraction = false;

      expect(lastOptions(renderer).hasMapMoveSinceLastRefine()).toBe(false);

      simulateEvent(mapInstance, 'center_changed');

      expect(lastOptions(renderer).hasMapMoveSinceLastRefine()).toBe(false);
    });

    it('expect to listen for "zoom_changed", trigger setMapMoveSinceLastRefine and schedule a refine call on user interaction', () => {
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

      expect(mapInstance.addListener).toHaveBeenCalledWith(
        'zoom_changed',
        expect.any(Function)
      );

      expect(lastRenderState(renderer).isPendingRefine).toBe(false);
      expect(lastOptions(renderer).hasMapMoveSinceLastRefine()).toBe(false);

      simulateEvent(mapInstance, 'zoom_changed');

      expect(lastRenderState(renderer).isPendingRefine).toBe(true);
      expect(lastOptions(renderer).hasMapMoveSinceLastRefine()).toBe(true);
    });

    it('expect to listen for "zoom_changed" and do not trigger on programmatic interaction', () => {
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

      expect(mapInstance.addListener).toHaveBeenCalledWith(
        'zoom_changed',
        expect.any(Function)
      );

      // Simulate programmatic event
      lastRenderState(renderer).isUserInteraction = false;

      expect(lastRenderState(renderer).isPendingRefine).toBe(false);
      expect(lastOptions(renderer).hasMapMoveSinceLastRefine()).toBe(false);

      simulateEvent(mapInstance, 'zoom_changed');

      expect(lastRenderState(renderer).isPendingRefine).toBe(false);
      expect(lastOptions(renderer).hasMapMoveSinceLastRefine()).toBe(false);
    });

    it('expect to listen for "dragstart" and schedule a refine call on user interaction', () => {
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

      expect(mapInstance.addListener).toHaveBeenCalledWith(
        'dragstart',
        expect.any(Function)
      );

      expect(lastRenderState(renderer).isPendingRefine).toBe(false);

      simulateEvent(mapInstance, 'dragstart');

      expect(lastRenderState(renderer).isPendingRefine).toBe(true);
    });

    it('expect to listen for "dragstart" and do not trigger on programmatic interaction', () => {
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

      expect(mapInstance.addListener).toHaveBeenCalledWith(
        'dragstart',
        expect.any(Function)
      );

      // Simulate programmatic event
      lastRenderState(renderer).isUserInteraction = false;

      expect(lastRenderState(renderer).isPendingRefine).toBe(false);

      simulateEvent(mapInstance, 'dragstart');

      expect(lastRenderState(renderer).isPendingRefine).toBe(false);
    });

    it('expect to listen for "idle", call refine and reset the scheduler', () => {
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

      expect(mapInstance.addListener).toHaveBeenCalledWith(
        'idle',
        expect.any(Function)
      );

      simulateEvent(mapInstance, 'idle');

      expect(lastRenderState(renderer).isPendingRefine).toBe(false);
      expect(helper.search).not.toHaveBeenCalled();
    });

    it('expect to listen for "idle" and do not trigger when refine on map move is disabled', () => {
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
        enableRefineOnMapMove: false,
      });

      widget.init({
        helper,
        instantSearchInstance,
        state: helper.state,
      });

      expect(mapInstance.addListener).toHaveBeenCalledWith(
        'idle',
        expect.any(Function)
      );

      simulateEvent(mapInstance, 'dragstart');
      simulateEvent(mapInstance, 'idle');

      expect(lastRenderState(renderer).isPendingRefine).toBe(true);
      expect(helper.search).not.toHaveBeenCalled();
    });
  });

  describe('initial position', () => {
    it('expect to init the position from "initalPostion" when no items are available & map is not yet render', () => {
      const container = createContainer();
      const instantSearchInstance = createFakeInstantSearch();
      const helper = createFakeHelper();
      const mapInstance = createFakeMapInstance();
      const googleReference = createFakeGoogleReference({ mapInstance });

      const widget = geoSearch({
        googleReference,
        container,
        initialZoom: 8,
        initialPosition: {
          lat: 10,
          lng: 12,
        },
      });

      widget.init({
        helper,
        instantSearchInstance,
        state: helper.state,
      });

      expect(mapInstance.setCenter).not.toHaveBeenCalled();
      expect(mapInstance.setZoom).not.toHaveBeenCalled();

      widget.render({
        helper,
        instantSearchInstance,
        results: {
          hits: [],
        },
      });

      expect(mapInstance.setCenter).toHaveBeenCalledWith({ lat: 10, lng: 12 });
      expect(mapInstance.setZoom).toHaveBeenCalledWith(8);
    });

    it('expect to init the position from "position" when no items are available & map is not yet render', () => {
      const container = createContainer();
      const instantSearchInstance = createFakeInstantSearch();
      const helper = createFakeHelper();
      const mapInstance = createFakeMapInstance();
      const googleReference = createFakeGoogleReference({ mapInstance });

      const widget = geoSearch({
        googleReference,
        container,
        initialZoom: 8,
        position: {
          lat: 12,
          lng: 14,
        },
        initialPosition: {
          lat: 10,
          lng: 12,
        },
      });

      // Simulate the configuration
      const initialState = widget.getConfiguration({});
      helper.setState(initialState);

      widget.init({
        helper,
        instantSearchInstance,
        state: helper.state,
      });

      expect(mapInstance.setCenter).not.toHaveBeenCalled();
      expect(mapInstance.setZoom).not.toHaveBeenCalled();

      widget.render({
        helper,
        instantSearchInstance,
        results: {
          hits: [],
        },
      });

      expect(mapInstance.setCenter).toHaveBeenCalledWith({ lat: 12, lng: 14 });
      expect(mapInstance.setZoom).toHaveBeenCalledWith(8);
    });

    it('expect to not init the position when items are available', () => {
      const container = createContainer();
      const instantSearchInstance = createFakeInstantSearch();
      const helper = createFakeHelper();
      const mapInstance = createFakeMapInstance();
      const googleReference = createFakeGoogleReference({ mapInstance });

      const widget = geoSearch({
        googleReference,
        container,
        initialZoom: 8,
        initialPosition: {
          lat: 10,
          lng: 12,
        },
      });

      widget.init({
        helper,
        instantSearchInstance,
        state: helper.state,
      });

      expect(mapInstance.setCenter).not.toHaveBeenCalled();
      expect(mapInstance.setZoom).not.toHaveBeenCalled();

      widget.render({
        helper,
        instantSearchInstance,
        results: {
          hits: [{ objectID: 123, _geoloc: true }],
        },
      });

      expect(mapInstance.setCenter).not.toHaveBeenCalled();
      expect(mapInstance.setZoom).not.toHaveBeenCalled();
    });

    it('expect to not init the position when the refinement is coming from the map', () => {
      const container = createContainer();
      const instantSearchInstance = createFakeInstantSearch();
      const helper = createFakeHelper();
      const mapInstance = createFakeMapInstance();
      const googleReference = createFakeGoogleReference({ mapInstance });

      const widget = geoSearch({
        googleReference,
        container,
        initialZoom: 8,
        initialPosition: {
          lat: 10,
          lng: 12,
        },
      });

      widget.init({
        helper,
        instantSearchInstance,
        state: helper.state,
      });

      expect(mapInstance.setCenter).not.toHaveBeenCalled();
      expect(mapInstance.setZoom).not.toHaveBeenCalled();

      widget.render({
        helper,
        instantSearchInstance,
        results: {
          hits: [{ objectID: 123, _geoloc: true }],
        },
      });

      // Simulate a refinement
      simulateEvent(mapInstance, 'dragstart');
      simulateEvent(mapInstance, 'center_changed');
      simulateEvent(mapInstance, 'idle');

      widget.render({
        helper,
        instantSearchInstance,
        results: {
          hits: [],
        },
      });

      expect(mapInstance.setCenter).not.toHaveBeenCalled();
      expect(mapInstance.setZoom).not.toHaveBeenCalled();
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
      const markerInstance = createFakeMarkerInstance();
      const googleReference = createFakeGoogleReference({ markerInstance });
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

      expect(onClick).toHaveBeenCalledWith(
        { type: 'click' },
        { objectID: 123, _geoloc: true }
      );

      expect(onMouseOver).toHaveBeenCalledWith(
        { type: 'mouseover' },
        { objectID: 123, _geoloc: true }
      );
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
          template: '<p>{{objectID}}</p>',
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

    it('expect to setup listeners on custom HTML markers', () => {
      const container = createContainer();
      const instantSearchInstance = createFakeInstantSearch();
      const helper = createFakeHelper();
      const googleReference = createFakeGoogleReference();
      const markerInstance = createFakeMarkerInstance();
      const HTMLMarker = jest.fn(() => markerInstance);
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

      expect(onClick).toHaveBeenCalledWith(
        { type: 'click' },
        { objectID: 123, _geoloc: true }
      );

      expect(onMouseOver).toHaveBeenCalledWith(
        { type: 'mouseover' },
        { objectID: 123, _geoloc: true }
      );
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

    it('expect to not append anyhing when the items are empty', () => {
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

  describe('fit markers position', () => {
    it('expect to set the position from makers', () => {
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
      expect(renderer).toHaveBeenCalledTimes(3);
    });

    it('expect to not set the position from makers when there is no markers', () => {
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
      expect(renderer).toHaveBeenCalledTimes(2);

      widget.render({
        helper,
        instantSearchInstance,
        results: {
          hits: [],
        },
      });

      expect(mapInstance.fitBounds).toHaveBeenCalledTimes(1);
      expect(renderer).toHaveBeenCalledTimes(3);
    });

    it('expect to not set the position from makers when the map has move since last refine', () => {
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
      expect(renderer).toHaveBeenCalledTimes(2);

      simulateEvent(mapInstance, 'center_changed');

      expect(mapInstance.fitBounds).toHaveBeenCalledTimes(1);
      expect(renderer).toHaveBeenCalledTimes(3);
    });

    it('expect to not set the position from makers when the refinement is coming from the map', () => {
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
      expect(renderer).toHaveBeenCalledTimes(2);

      simulateEvent(mapInstance, 'dragstart');
      simulateEvent(mapInstance, 'center_changed');

      expect(mapInstance.fitBounds).toHaveBeenCalledTimes(1);
      expect(renderer).toHaveBeenCalledTimes(3);

      simulateEvent(mapInstance, 'idle');

      widget.render({
        helper,
        instantSearchInstance,
        results: {
          hits: [{ objectID: 123, _geoloc: true }],
        },
      });

      expect(mapInstance.fitBounds).toHaveBeenCalledTimes(1);
      expect(renderer).toHaveBeenCalledTimes(4);
    });
  });
});
