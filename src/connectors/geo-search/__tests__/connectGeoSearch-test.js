import searchHelper, { SearchResults } from 'algoliasearch-helper';
import connectGeoSearch from '../connectGeoSearch';

const createFakeClient = () => ({
  addAlgoliaAgent: () => {},
});

const createFakeHelper = client => {
  const helper = searchHelper(client);

  helper.search = jest.fn();

  return helper;
};

describe('connectGeoSearch', () => {
  it('expect to be a widget', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customGeoSearch = connectGeoSearch(render, unmount);
    const widget = customGeoSearch();

    expect(widget).toEqual({
      getConfiguration: expect.any(Function),
      init: expect.any(Function),
      render: expect.any(Function),
      dispose: expect.any(Function),
    });
  });

  it('expect to render twice during init and render', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customGeoSearch = connectGeoSearch(render, unmount);
    const widget = customGeoSearch();

    const client = createFakeClient();
    const helper = createFakeHelper(client);

    // Simulate the "init" lifecycle
    widget.init({
      state: helper.getState(),
      helper,
    });

    expect(render).toHaveBeenCalledTimes(1);
    expect(render).toHaveBeenLastCalledWith(
      expect.objectContaining({
        items: [],
        refine: expect.any(Function),
        clearMapRefinement: expect.any(Function),
        toggleRefineOnMapMove: expect.any(Function),
        setMapMoveSinceLastRefine: expect.any(Function),
        widgetParams: {},
      }),
      true
    );

    expect(render.mock.calls[0][0].isRefineOnMapMove()).toBe(true);
    expect(render.mock.calls[0][0].hasMapMoveSinceLastRefine()).toBe(false);
    expect(render.mock.calls[0][0].isRefinedWithMap()).toBe(false);

    // Simulate the "render" lifecycle
    widget.render({
      results: new SearchResults(helper.getState(), [
        {
          hits: [
            { objectID: 123, _geoloc: { lat: 10, lng: 12 } },
            { objectID: 456, _geoloc: { lat: 12, lng: 14 } },
            { objectID: 789, _geoloc: { lat: 14, lng: 16 } },
          ],
        },
      ]),
      state: helper.getState(),
      helper,
    });

    expect(render).toHaveBeenCalledTimes(2);
    expect(render).toHaveBeenLastCalledWith(
      expect.objectContaining({
        items: [
          { objectID: 123, _geoloc: { lat: 10, lng: 12 } },
          { objectID: 456, _geoloc: { lat: 12, lng: 14 } },
          { objectID: 789, _geoloc: { lat: 14, lng: 16 } },
        ],
        refine: expect.any(Function),
        clearMapRefinement: expect.any(Function),
        toggleRefineOnMapMove: expect.any(Function),
        setMapMoveSinceLastRefine: expect.any(Function),
        widgetParams: {},
      }),
      false
    );

    expect(render.mock.calls[0][0].isRefineOnMapMove()).toBe(true);
    expect(render.mock.calls[0][0].hasMapMoveSinceLastRefine()).toBe(false);
    expect(render.mock.calls[0][0].isRefinedWithMap()).toBe(false);
  });

  describe('refine', () => {
    it('expect to refine with the given bounds during init', () => {
      const northEast = {
        lat: 12,
        lng: 10,
      };

      const southWest = {
        lat: 40,
        lng: 42,
      };

      const render = jest.fn();
      const unmount = jest.fn();

      const customGeoSearch = connectGeoSearch(render, unmount);
      const widget = customGeoSearch();

      const client = createFakeClient();
      const helper = createFakeHelper(client);

      // Simulate the "init" lifecycle
      widget.init({
        state: helper.getState(),
        helper,
      });

      render.mock.calls[0][0].refine({ northEast, southWest });

      expect(render.mock.calls[0][0].hasMapMoveSinceLastRefine()).toBe(false);
      expect(render.mock.calls[0][0].isRefinedWithMap()).toBe(true);
      expect(helper.getState().insideBoundingBox).toEqual([[12, 10, 40, 42]]);
      expect(helper.search).toHaveBeenCalledTimes(1);
    });

    it('expect to refine when the map move with the given bounds during render', () => {
      const northEast = {
        lat: 12,
        lng: 10,
      };

      const southWest = {
        lat: 40,
        lng: 42,
      };

      const render = jest.fn();
      const unmount = jest.fn();

      const customGeoSearch = connectGeoSearch(render, unmount);
      const widget = customGeoSearch();

      const client = createFakeClient();
      const helper = createFakeHelper(client);

      // Simulate the "render" lifecycle
      widget.render({
        results: new SearchResults(helper.getState(), [
          {
            hits: [{ objectID: 123, _geoloc: { lat: 10, lng: 12 } }],
          },
        ]),
        state: helper.getState(),
        helper,
      });

      render.mock.calls[0][0].refine({ northEast, southWest });

      expect(render.mock.calls[0][0].hasMapMoveSinceLastRefine()).toBe(false);
      expect(render.mock.calls[0][0].isRefinedWithMap()).toBe(true);
      expect(helper.getState().insideBoundingBox).toEqual([[12, 10, 40, 42]]);
      expect(helper.search).toHaveBeenCalledTimes(1);
    });
  });

  describe('clearMapRefinement', () => {
    it('expect to clear the map refinement after the map has been refine during init', () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const customGeoSearch = connectGeoSearch(render, unmount);
      const widget = customGeoSearch();

      const client = createFakeClient();
      const helper = createFakeHelper(client);

      const northEast = {
        lat: 12,
        lng: 10,
      };

      const southWest = {
        lat: 40,
        lng: 42,
      };

      const results = new SearchResults(helper.getState(), [
        {
          hits: [{ objectID: 123, _geoloc: { lat: 10, lng: 12 } }],
        },
      ]);

      widget.init({
        state: helper.getState(),
        helper,
      });

      expect(render).toHaveBeenCalledTimes(1);
      expect(render.mock.calls[0][0].hasMapMoveSinceLastRefine()).toBe(false);
      expect(render.mock.calls[0][0].isRefinedWithMap()).toBe(false);
      expect(helper.getState().insideBoundingBox).toBe(undefined);
      expect(helper.search).not.toHaveBeenCalled();

      render.mock.calls[0][0].refine({ northEast, southWest });

      widget.render({
        state: helper.getState(),
        results,
        helper,
      });

      expect(render).toHaveBeenCalledTimes(2);
      expect(render.mock.calls[1][0].hasMapMoveSinceLastRefine()).toBe(false);
      expect(render.mock.calls[1][0].isRefinedWithMap()).toBe(true);
      expect(helper.getState().insideBoundingBox).toEqual([[12, 10, 40, 42]]);
      expect(helper.search).toHaveBeenCalledTimes(1);

      render.mock.calls[0][0].clearMapRefinement();

      widget.render({
        state: helper.getState(),
        results,
        helper,
      });

      expect(render).toHaveBeenCalledTimes(3);
      expect(render.mock.calls[2][0].hasMapMoveSinceLastRefine()).toBe(false);
      expect(render.mock.calls[2][0].isRefinedWithMap()).toBe(false);
      expect(helper.getState().insideBoundingBox).toBe(undefined);
      expect(helper.search).toHaveBeenCalledTimes(2);
    });

    it('expect to clear the map refinement after the map has been refine during render', () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const customGeoSearch = connectGeoSearch(render, unmount);
      const widget = customGeoSearch();

      const client = createFakeClient();
      const helper = createFakeHelper(client);

      const northEast = {
        lat: 12,
        lng: 10,
      };

      const southWest = {
        lat: 40,
        lng: 42,
      };

      const results = new SearchResults(helper.getState(), [
        {
          hits: [{ objectID: 123, _geoloc: { lat: 10, lng: 12 } }],
        },
      ]);

      widget.render({
        state: helper.getState(),
        results,
        helper,
      });

      expect(render).toHaveBeenCalledTimes(1);
      expect(render.mock.calls[0][0].hasMapMoveSinceLastRefine()).toBe(false);
      expect(render.mock.calls[0][0].isRefinedWithMap()).toBe(false);
      expect(helper.getState().insideBoundingBox).toBe(undefined);
      expect(helper.search).not.toHaveBeenCalled();

      render.mock.calls[0][0].refine({ northEast, southWest });

      widget.render({
        state: helper.getState(),
        results,
        helper,
      });

      expect(render).toHaveBeenCalledTimes(2);
      expect(render.mock.calls[1][0].hasMapMoveSinceLastRefine()).toBe(false);
      expect(render.mock.calls[1][0].isRefinedWithMap()).toBe(true);
      expect(helper.getState().insideBoundingBox).toEqual([[12, 10, 40, 42]]);
      expect(helper.search).toHaveBeenCalledTimes(1);

      render.mock.calls[0][0].clearMapRefinement();

      widget.render({
        state: helper.getState(),
        results,
        helper,
      });

      expect(render).toHaveBeenCalledTimes(3);
      expect(render.mock.calls[2][0].hasMapMoveSinceLastRefine()).toBe(false);
      expect(render.mock.calls[2][0].isRefinedWithMap()).toBe(false);
      expect(helper.getState().insideBoundingBox).toBe(undefined);
      expect(helper.search).toHaveBeenCalledTimes(2);
    });
  });

  describe('toggleRefineOnMapMove', () => {
    it('expect to toggle refine on map move during init', () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const customGeoSearch = connectGeoSearch(render, unmount);
      const widget = customGeoSearch();

      const client = createFakeClient();
      const helper = createFakeHelper(client);

      // Simulate the "init" lifecycle
      widget.init({
        state: helper.getState(),
        helper,
      });

      expect(render).toHaveBeenCalledTimes(1);
      expect(render.mock.calls[0][0].isRefineOnMapMove()).toBe(true);

      render.mock.calls[0][0].toggleRefineOnMapMove();

      expect(render).toHaveBeenCalledTimes(1);
      expect(render.mock.calls[0][0].isRefineOnMapMove()).toBe(false);

      // Simulate the "render" lifecycle
      widget.render({
        results: new SearchResults(helper.getState(), [
          {
            hits: [{ objectID: 123, _geoloc: { lat: 10, lng: 12 } }],
          },
        ]),
        state: helper.getState(),
        helper,
      });

      expect(render).toHaveBeenCalledTimes(2);
      expect(render.mock.calls[0][0].isRefineOnMapMove()).toBe(false);
      expect(render.mock.calls[0][0].toggleRefineOnMapMove).toBe(
        render.mock.calls[1][0].toggleRefineOnMapMove
      );
    });

    it('expect to toggle refine on map move during render', () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const customGeoSearch = connectGeoSearch(render, unmount);
      const widget = customGeoSearch();

      const client = createFakeClient();
      const helper = createFakeHelper(client);

      // Simulate the "render" lifecycle
      widget.render({
        results: new SearchResults(helper.getState(), [
          {
            hits: [{ objectID: 123, _geoloc: { lat: 10, lng: 12 } }],
          },
        ]),
        state: helper.getState(),
        helper,
      });

      expect(render).toHaveBeenCalledTimes(1);
      expect(render.mock.calls[0][0].isRefineOnMapMove()).toBe(true);

      render.mock.calls[0][0].toggleRefineOnMapMove();

      expect(render).toHaveBeenCalledTimes(2);
      expect(render.mock.calls[1][0].isRefineOnMapMove()).toBe(false);
      expect(render.mock.calls[0][0].toggleRefineOnMapMove).toBe(
        render.mock.calls[1][0].toggleRefineOnMapMove
      );
    });
  });

  describe('getConfiguration', () => {
    describe('aroundLatLngViaIP', () => {
      it('expect to set aroundLatLngViaIP', () => {
        const render = jest.fn();
        const unmount = jest.fn();

        const customGeoSearch = connectGeoSearch(render, unmount);
        const widget = customGeoSearch({
          enableGeolocationWithIP: true,
        });

        const expectation = {
          aroundLatLngViaIP: true,
        };

        const actual = widget.getConfiguration({});

        expect(actual).toEqual(expectation);
      });

      it('expect to not set aroundLatLngViaIP when position is given', () => {
        const render = jest.fn();
        const unmount = jest.fn();

        const customGeoSearch = connectGeoSearch(render, unmount);
        const widget = customGeoSearch({
          enableGeolocationWithIP: true,
          position: {
            lat: 12,
            lng: 10,
          },
        });

        const expectation = {
          aroundLatLng: '12, 10',
        };

        const actual = widget.getConfiguration({});

        expect(actual).toEqual(expectation);
      });

      it("expect to not set aroundLatLngViaIP when it's already set", () => {
        const render = jest.fn();
        const unmount = jest.fn();

        const customGeoSearch = connectGeoSearch(render, unmount);
        const widget = customGeoSearch({
          enableGeolocationWithIP: true,
        });

        const expectation = {};

        const actual = widget.getConfiguration({
          aroundLatLngViaIP: false,
        });

        expect(actual).toEqual(expectation);
      });

      it('expect to not set aroundLatLngViaIP when aroundLatLng is already set', () => {
        const render = jest.fn();
        const unmount = jest.fn();

        const customGeoSearch = connectGeoSearch(render, unmount);
        const widget = customGeoSearch({
          enableGeolocationWithIP: true,
        });

        const expectation = {};

        const actual = widget.getConfiguration({
          aroundLatLng: '10, 12',
        });

        expect(actual).toEqual(expectation);
      });
    });

    describe('aroundLatLng', () => {
      it('expect to set aroundLatLng', () => {
        const render = jest.fn();
        const unmount = jest.fn();

        const customGeoSearch = connectGeoSearch(render, unmount);
        const widget = customGeoSearch({
          position: {
            lat: 12,
            lng: 10,
          },
        });

        const expectation = {
          aroundLatLng: '12, 10',
        };

        const actual = widget.getConfiguration({});

        expect(actual).toEqual(expectation);
      });

      it('expect to set aroundLatLng when aroundLatLngViaIP is already set to false', () => {
        const render = jest.fn();
        const unmount = jest.fn();

        const customGeoSearch = connectGeoSearch(render, unmount);
        const widget = customGeoSearch({
          position: {
            lat: 12,
            lng: 10,
          },
        });

        const expectation = {
          aroundLatLng: '12, 10',
        };

        const actual = widget.getConfiguration({
          aroundLatLngViaIP: false,
        });

        expect(actual).toEqual(expectation);
      });

      it("expect to not set aroundLatLng when it's already set", () => {
        const render = jest.fn();
        const unmount = jest.fn();

        const customGeoSearch = connectGeoSearch(render, unmount);
        const widget = customGeoSearch({
          position: {
            lat: 12,
            lng: 10,
          },
        });

        const expectation = {};

        const actual = widget.getConfiguration({
          aroundLatLng: '12, 12',
        });

        expect(actual).toEqual(expectation);
      });

      it('expect to not set aroundLatLng when aroundLatLngViaIP is already set to true', () => {
        const render = jest.fn();
        const unmount = jest.fn();

        const customGeoSearch = connectGeoSearch(render, unmount);
        const widget = customGeoSearch({
          position: {
            lat: 12,
            lng: 10,
          },
        });

        const expectation = {};

        const actual = widget.getConfiguration({
          aroundLatLngViaIP: true,
        });

        expect(actual).toEqual(expectation);
      });
    });

    describe('aroundRadius', () => {
      it('expect to set aroundRadius', () => {
        const render = jest.fn();
        const unmount = jest.fn();

        const customGeoSearch = connectGeoSearch(render, unmount);
        const widget = customGeoSearch({
          radius: 1000,
        });

        const expectation = {
          aroundLatLngViaIP: true,
          aroundRadius: 1000,
        };

        const actual = widget.getConfiguration({});

        expect(actual).toEqual(expectation);
      });

      it("expect to not set aroundRadius when it's already defined", () => {
        const render = jest.fn();
        const unmount = jest.fn();

        const customGeoSearch = connectGeoSearch(render, unmount);
        const widget = customGeoSearch({
          radius: 1000,
        });

        const expectation = {
          aroundLatLngViaIP: true,
        };

        const actual = widget.getConfiguration({
          aroundRadius: 500,
        });

        expect(actual).toEqual(expectation);
      });
    });

    describe('aroundPrecision', () => {
      it('expect to set aroundPrecision', () => {
        const render = jest.fn();
        const unmount = jest.fn();

        const customGeoSearch = connectGeoSearch(render, unmount);
        const widget = customGeoSearch({
          precision: 1000,
        });

        const expectation = {
          aroundLatLngViaIP: true,
          aroundPrecision: 1000,
        };

        const actual = widget.getConfiguration({});

        expect(actual).toEqual(expectation);
      });

      it("expect to not set aroundPrecision when it's already defined", () => {
        const render = jest.fn();
        const unmount = jest.fn();

        const customGeoSearch = connectGeoSearch(render, unmount);
        const widget = customGeoSearch({
          precision: 1000,
        });

        const expectation = {
          aroundLatLngViaIP: true,
        };

        const actual = widget.getConfiguration({
          aroundPrecision: 500,
        });

        expect(actual).toEqual(expectation);
      });
    });
  });
});
