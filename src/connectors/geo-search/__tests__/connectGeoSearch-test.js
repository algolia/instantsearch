import last from 'lodash/last';
import first from 'lodash/first';
import algoliasearchHelper, {
  SearchResults,
  SearchParameters,
} from 'algoliasearch-helper';
import connectGeoSearch from '../connectGeoSearch';

const createFakeClient = () => ({
  addAlgoliaAgent: () => {},
});

const createFakeHelper = client => {
  const helper = algoliasearchHelper(client);

  helper.search = jest.fn();

  return helper;
};

const firstRenderArgs = fn => first(fn.mock.calls)[0];
const lastRenderArgs = fn => last(fn.mock.calls)[0];

describe('connectGeoSearch - rendering', () => {
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
    const instantSearchInstance = { client, helper };

    widget.init({
      state: helper.state,
      instantSearchInstance,
      helper,
    });

    expect(render).toHaveBeenCalledTimes(1);
    expect(render).toHaveBeenLastCalledWith(
      {
        items: [],
        position: undefined,
        refine: expect.any(Function),
        clearMapRefinement: expect.any(Function),
        isRefinedWithMap: expect.any(Function),
        toggleRefineOnMapMove: expect.any(Function),
        isRefineOnMapMove: expect.any(Function),
        setMapMoveSinceLastRefine: expect.any(Function),
        hasMapMoveSinceLastRefine: expect.any(Function),
        widgetParams: {},
        instantSearchInstance,
      },
      true
    );

    expect(lastRenderArgs(render).isRefineOnMapMove()).toBe(true);
    expect(lastRenderArgs(render).hasMapMoveSinceLastRefine()).toBe(false);
    expect(lastRenderArgs(render).isRefinedWithMap()).toBe(false);

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
      helper,
      instantSearchInstance,
    });

    expect(render).toHaveBeenCalledTimes(2);
    expect(render).toHaveBeenLastCalledWith(
      expect.objectContaining({
        items: [
          { objectID: 123, _geoloc: { lat: 10, lng: 12 } },
          { objectID: 456, _geoloc: { lat: 12, lng: 14 } },
          { objectID: 789, _geoloc: { lat: 14, lng: 16 } },
        ],
        position: undefined,
        refine: expect.any(Function),
        clearMapRefinement: expect.any(Function),
        toggleRefineOnMapMove: expect.any(Function),
        setMapMoveSinceLastRefine: expect.any(Function),
        widgetParams: {},
        instantSearchInstance,
      }),
      false
    );

    expect(lastRenderArgs(render).isRefineOnMapMove()).toBe(true);
    expect(lastRenderArgs(render).hasMapMoveSinceLastRefine()).toBe(false);
    expect(lastRenderArgs(render).isRefinedWithMap()).toBe(false);
  });

  it('expect to render with enableRefineOnMapMove disabled', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customGeoSearch = connectGeoSearch(render, unmount);
    const widget = customGeoSearch({
      enableRefineOnMapMove: false,
    });

    const client = createFakeClient();
    const helper = createFakeHelper(client);

    widget.init({
      state: helper.state,
      helper,
    });

    expect(render).toHaveBeenCalledTimes(1);
    expect(lastRenderArgs(render).isRefineOnMapMove()).toBe(false);

    widget.render({
      results: new SearchResults(helper.getState(), [
        {
          hits: [{ objectID: 123, _geoloc: { lat: 10, lng: 12 } }],
        },
      ]),
      helper,
    });

    expect(render).toHaveBeenCalledTimes(2);
    expect(lastRenderArgs(render).isRefineOnMapMove()).toBe(false);
  });

  it('expect to render with only geoloc hits', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customGeoSearch = connectGeoSearch(render, unmount);
    const widget = customGeoSearch();

    const client = createFakeClient();
    const helper = createFakeHelper(client);

    widget.render({
      results: new SearchResults(helper.getState(), [
        {
          hits: [
            { objectID: 123, _geoloc: { lat: 10, lng: 12 } },
            { objectID: 456 },
            { objectID: 789, _geoloc: { lat: 10, lng: 12 } },
          ],
        },
      ]),
      helper,
    });

    expect(render).toHaveBeenLastCalledWith(
      expect.objectContaining({
        items: [
          { objectID: 123, _geoloc: { lat: 10, lng: 12 } },
          { objectID: 789, _geoloc: { lat: 10, lng: 12 } },
        ],
      }),
      false
    );
  });

  it('expect to render with position from the state', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customGeoSearch = connectGeoSearch(render, unmount);
    const widget = customGeoSearch({
      position: {
        lat: 10,
        lng: 12,
      },
    });

    const client = createFakeClient();
    const helper = createFakeHelper(client);

    // Simulate the configuration or external setter
    helper.setQueryParameter('aroundLatLng', '10, 12');

    widget.init({
      helper,
      state: helper.state,
    });

    expect(render).toHaveBeenCalledTimes(1);
    expect(render).toHaveBeenCalledWith(
      expect.objectContaining({
        position: {
          lat: 10,
          lng: 12,
        },
      }),
      true
    );

    widget.render({
      results: new SearchResults(helper.getState(), [
        {
          hits: [],
        },
      ]),
      helper,
    });

    expect(render).toHaveBeenCalledTimes(2);
    expect(render).toHaveBeenCalledWith(
      expect.objectContaining({
        position: {
          lat: 10,
          lng: 12,
        },
      }),
      false
    );

    // Simulate the configuration or external setter
    helper.setQueryParameter('aroundLatLng', '12, 14');

    widget.render({
      results: new SearchResults(helper.getState(), [
        {
          hits: [],
        },
      ]),
      helper,
    });

    expect(render).toHaveBeenCalledTimes(3);
    expect(render).toHaveBeenCalledWith(
      expect.objectContaining({
        position: {
          lat: 12,
          lng: 14,
        },
      }),
      false
    );
  });

  it('expect to render with insideBoundingBox from the state', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customGeoSearch = connectGeoSearch(render, unmount);
    const widget = customGeoSearch({
      position: {
        lat: 10,
        lng: 12,
      },
    });

    const client = createFakeClient();
    const helper = createFakeHelper(client);

    // Simulate the configuration or external setter
    helper.setQueryParameter('insideBoundingBox', [
      [
        48.84174222399724,
        2.367719162523599,
        48.81614630305218,
        2.284205902635904,
      ],
    ]);

    widget.init({
      helper,
      state: helper.state,
    });

    expect(render).toHaveBeenCalledTimes(1);
    expect(lastRenderArgs(render).isRefinedWithMap()).toBe(true);

    widget.render({
      results: new SearchResults(helper.getState(), [
        {
          hits: [],
        },
      ]),
      helper,
    });

    expect(render).toHaveBeenCalledTimes(2);
    expect(lastRenderArgs(render).isRefinedWithMap()).toBe(true);

    // Simulate the configuration or external setter
    helper.setQueryParameter('insideBoundingBox');

    widget.render({
      results: new SearchResults(helper.getState(), [
        {
          hits: [],
        },
      ]),
      helper,
    });

    expect(render).toHaveBeenCalledTimes(3);
    expect(lastRenderArgs(render).isRefinedWithMap()).toBe(false);
  });

  it('expect to reset the map state when position changed', () => {
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
        hits: [
          { objectID: 123, _geoloc: { lat: 10, lng: 12 } },
          { objectID: 456 },
          { objectID: 789, _geoloc: { lat: 10, lng: 12 } },
        ],
      },
    ]);

    helper.setQueryParameter('aroundLatLng', '10,12');

    widget.render({
      results,
      helper,
    });

    lastRenderArgs(render).refine({ northEast, southWest });

    widget.render({
      results,
      helper,
    });

    expect(render).toHaveBeenCalledTimes(2);
    expect(lastRenderArgs(render).hasMapMoveSinceLastRefine()).toBe(false);
    expect(lastRenderArgs(render).isRefinedWithMap()).toBe(true);

    lastRenderArgs(render).setMapMoveSinceLastRefine();

    expect(render).toHaveBeenCalledTimes(3);
    expect(lastRenderArgs(render).hasMapMoveSinceLastRefine()).toBe(true);
    expect(lastRenderArgs(render).isRefinedWithMap()).toBe(true);

    helper.setQueryParameter('aroundLatLng', '14,16');

    widget.render({
      results,
      helper,
    });

    expect(render).toHaveBeenCalledTimes(4);
    expect(lastRenderArgs(render).hasMapMoveSinceLastRefine()).toBe(false);
    expect(lastRenderArgs(render).isRefinedWithMap()).toBe(true);
  });

  it("expect to not reset the map state when position don't changed", () => {
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
        hits: [
          { objectID: 123, _geoloc: { lat: 10, lng: 12 } },
          { objectID: 456 },
          { objectID: 789, _geoloc: { lat: 10, lng: 12 } },
        ],
      },
    ]);

    helper.setQueryParameter('aroundLatLng', '10,12');

    widget.render({
      results,
      helper,
    });

    lastRenderArgs(render).refine({ northEast, southWest });

    widget.render({
      results,
      helper,
    });

    expect(render).toHaveBeenCalledTimes(2);
    expect(lastRenderArgs(render).hasMapMoveSinceLastRefine()).toBe(false);
    expect(lastRenderArgs(render).isRefinedWithMap()).toBe(true);

    lastRenderArgs(render).setMapMoveSinceLastRefine();

    expect(render).toHaveBeenCalledTimes(3);
    expect(lastRenderArgs(render).hasMapMoveSinceLastRefine()).toBe(true);
    expect(lastRenderArgs(render).isRefinedWithMap()).toBe(true);

    helper.setQueryParameter('aroundLatLng', '10,12');

    widget.render({
      results,
      helper,
    });

    expect(render).toHaveBeenCalledTimes(4);
    expect(lastRenderArgs(render).hasMapMoveSinceLastRefine()).toBe(true);
    expect(lastRenderArgs(render).isRefinedWithMap()).toBe(true);
  });

  it('expect to reset the map state when boundingBox is reset', () => {
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
        hits: [
          { objectID: 123, _geoloc: { lat: 10, lng: 12 } },
          { objectID: 456 },
          { objectID: 789, _geoloc: { lat: 10, lng: 12 } },
        ],
      },
    ]);

    helper.setQueryParameter('insideBoundingBox', '10,12,14,16');

    widget.render({
      results,
      helper,
    });

    lastRenderArgs(render).refine({ northEast, southWest });

    widget.render({
      results,
      helper,
    });

    expect(render).toHaveBeenCalledTimes(2);
    expect(lastRenderArgs(render).hasMapMoveSinceLastRefine()).toBe(false);
    expect(lastRenderArgs(render).isRefinedWithMap()).toBe(true);

    lastRenderArgs(render).setMapMoveSinceLastRefine();

    expect(render).toHaveBeenCalledTimes(3);
    expect(lastRenderArgs(render).hasMapMoveSinceLastRefine()).toBe(true);
    expect(lastRenderArgs(render).isRefinedWithMap()).toBe(true);

    helper.setQueryParameter('insideBoundingBox');

    widget.render({
      results,
      helper,
    });

    expect(render).toHaveBeenCalledTimes(4);
    expect(lastRenderArgs(render).hasMapMoveSinceLastRefine()).toBe(false);
    expect(lastRenderArgs(render).isRefinedWithMap()).toBe(false);
  });

  it('expect to not reset the map state when boundingBox is preserve', () => {
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
        hits: [
          { objectID: 123, _geoloc: { lat: 10, lng: 12 } },
          { objectID: 456 },
          { objectID: 789, _geoloc: { lat: 10, lng: 12 } },
        ],
      },
    ]);

    helper.setQueryParameter('insideBoundingBox', '10,12,14,16');

    widget.render({
      results,
      helper,
    });

    lastRenderArgs(render).refine({ northEast, southWest });

    widget.render({
      results,
      helper,
    });

    expect(render).toHaveBeenCalledTimes(2);
    expect(lastRenderArgs(render).hasMapMoveSinceLastRefine()).toBe(false);
    expect(lastRenderArgs(render).isRefinedWithMap()).toBe(true);

    lastRenderArgs(render).setMapMoveSinceLastRefine();

    expect(render).toHaveBeenCalledTimes(3);
    expect(lastRenderArgs(render).hasMapMoveSinceLastRefine()).toBe(true);
    expect(lastRenderArgs(render).isRefinedWithMap()).toBe(true);

    helper.setQueryParameter('insideBoundingBox', '12,14,16,18');

    widget.render({
      results,
      helper,
    });

    expect(render).toHaveBeenCalledTimes(4);
    expect(lastRenderArgs(render).hasMapMoveSinceLastRefine()).toBe(true);
    expect(lastRenderArgs(render).isRefinedWithMap()).toBe(true);
  });

  describe('refine', () => {
    it('expect to refine with the given bounds during init', () => {
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
        state: helper.state,
        helper,
      });

      expect(render).toHaveBeenCalledTimes(1);
      expect(lastRenderArgs(render).hasMapMoveSinceLastRefine()).toBe(false);
      expect(lastRenderArgs(render).isRefinedWithMap()).toBe(false);
      expect(helper.getState().insideBoundingBox).toBe(undefined);
      expect(helper.search).not.toHaveBeenCalled();

      lastRenderArgs(render).refine({ northEast, southWest });

      widget.render({
        results,
        helper,
      });

      expect(render).toHaveBeenCalledTimes(2);
      expect(lastRenderArgs(render).hasMapMoveSinceLastRefine()).toBe(false);
      expect(lastRenderArgs(render).isRefinedWithMap()).toBe(true);
      expect(helper.getState().insideBoundingBox).toEqual('12,10,40,42');
      expect(helper.search).toHaveBeenCalledTimes(1);
    });

    it('expect to refine with the given bounds during render', () => {
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
        results,
        helper,
      });

      expect(render).toHaveBeenCalledTimes(1);
      expect(lastRenderArgs(render).hasMapMoveSinceLastRefine()).toBe(false);
      expect(lastRenderArgs(render).isRefinedWithMap()).toBe(false);
      expect(helper.getState().insideBoundingBox).toBe(undefined);
      expect(helper.search).not.toHaveBeenCalled();

      lastRenderArgs(render).refine({ northEast, southWest });

      widget.render({
        results,
        helper,
      });

      expect(render).toHaveBeenCalledTimes(2);
      expect(lastRenderArgs(render).hasMapMoveSinceLastRefine()).toBe(false);
      expect(lastRenderArgs(render).isRefinedWithMap()).toBe(true);
      expect(helper.getState().insideBoundingBox).toEqual('12,10,40,42');
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
        state: helper.state,
        helper,
      });

      expect(render).toHaveBeenCalledTimes(1);
      expect(lastRenderArgs(render).hasMapMoveSinceLastRefine()).toBe(false);
      expect(lastRenderArgs(render).isRefinedWithMap()).toBe(false);
      expect(helper.getState().insideBoundingBox).toBe(undefined);
      expect(helper.search).not.toHaveBeenCalled();

      lastRenderArgs(render).refine({ northEast, southWest });

      widget.render({
        results,
        helper,
      });

      expect(render).toHaveBeenCalledTimes(2);
      expect(lastRenderArgs(render).hasMapMoveSinceLastRefine()).toBe(false);
      expect(lastRenderArgs(render).isRefinedWithMap()).toBe(true);
      expect(helper.getState().insideBoundingBox).toEqual('12,10,40,42');
      expect(helper.search).toHaveBeenCalledTimes(1);

      lastRenderArgs(render).clearMapRefinement();

      widget.render({
        results,
        helper,
      });

      expect(render).toHaveBeenCalledTimes(3);
      expect(lastRenderArgs(render).hasMapMoveSinceLastRefine()).toBe(false);
      expect(lastRenderArgs(render).isRefinedWithMap()).toBe(false);
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
        results,
        helper,
      });

      expect(render).toHaveBeenCalledTimes(1);
      expect(lastRenderArgs(render).hasMapMoveSinceLastRefine()).toBe(false);
      expect(lastRenderArgs(render).isRefinedWithMap()).toBe(false);
      expect(helper.getState().insideBoundingBox).toBe(undefined);
      expect(helper.search).not.toHaveBeenCalled();

      lastRenderArgs(render).refine({ northEast, southWest });

      widget.render({
        results,
        helper,
      });

      expect(render).toHaveBeenCalledTimes(2);
      expect(lastRenderArgs(render).hasMapMoveSinceLastRefine()).toBe(false);
      expect(lastRenderArgs(render).isRefinedWithMap()).toBe(true);
      expect(helper.getState().insideBoundingBox).toEqual('12,10,40,42');
      expect(helper.search).toHaveBeenCalledTimes(1);

      lastRenderArgs(render).clearMapRefinement();

      widget.render({
        results,
        helper,
      });

      expect(render).toHaveBeenCalledTimes(3);
      expect(lastRenderArgs(render).hasMapMoveSinceLastRefine()).toBe(false);
      expect(lastRenderArgs(render).isRefinedWithMap()).toBe(false);
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

      widget.init({
        state: helper.state,
        helper,
      });

      expect(render).toHaveBeenCalledTimes(1);
      expect(lastRenderArgs(render).isRefineOnMapMove()).toBe(true);

      lastRenderArgs(render).toggleRefineOnMapMove();

      expect(render).toHaveBeenCalledTimes(1);
      expect(lastRenderArgs(render).isRefineOnMapMove()).toBe(false);

      widget.render({
        results: new SearchResults(helper.getState(), [
          {
            hits: [{ objectID: 123, _geoloc: { lat: 10, lng: 12 } }],
          },
        ]),
        helper,
      });

      expect(render).toHaveBeenCalledTimes(2);
      expect(lastRenderArgs(render).isRefineOnMapMove()).toBe(false);
      expect(firstRenderArgs(render).toggleRefineOnMapMove).toBe(
        lastRenderArgs(render).toggleRefineOnMapMove
      );
    });

    it('expect to toggle refine on map move during render', () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const customGeoSearch = connectGeoSearch(render, unmount);
      const widget = customGeoSearch();

      const client = createFakeClient();
      const helper = createFakeHelper(client);

      widget.render({
        results: new SearchResults(helper.getState(), [
          {
            hits: [{ objectID: 123, _geoloc: { lat: 10, lng: 12 } }],
          },
        ]),
        helper,
      });

      expect(render).toHaveBeenCalledTimes(1);
      expect(lastRenderArgs(render).isRefineOnMapMove()).toBe(true);

      lastRenderArgs(render).toggleRefineOnMapMove();

      expect(render).toHaveBeenCalledTimes(2);
      expect(lastRenderArgs(render).isRefineOnMapMove()).toBe(false);
      expect(firstRenderArgs(render).toggleRefineOnMapMove).toBe(
        lastRenderArgs(render).toggleRefineOnMapMove
      );
    });
  });

  describe('setMapMoveSinceLastRefine', () => {
    it('expect to set map move during init', () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const customGeoSearch = connectGeoSearch(render, unmount);
      const widget = customGeoSearch();

      const client = createFakeClient();
      const helper = createFakeHelper(client);

      widget.init({
        state: helper.state,
        helper,
      });

      expect(render).toHaveBeenCalledTimes(1);
      expect(lastRenderArgs(render).hasMapMoveSinceLastRefine()).toBe(false);

      lastRenderArgs(render).setMapMoveSinceLastRefine();

      expect(render).toHaveBeenCalledTimes(1);
      expect(lastRenderArgs(render).hasMapMoveSinceLastRefine()).toBe(true);

      widget.render({
        results: new SearchResults(helper.getState(), [
          {
            hits: [{ objectID: 123, _geoloc: { lat: 10, lng: 12 } }],
          },
        ]),
        helper,
      });

      expect(render).toHaveBeenCalledTimes(2);
      expect(lastRenderArgs(render).hasMapMoveSinceLastRefine()).toBe(true);
      expect(firstRenderArgs(render).setMapMoveSinceLastRefine).toBe(
        lastRenderArgs(render).setMapMoveSinceLastRefine
      );
    });

    it('expect to set map move during render', () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const customGeoSearch = connectGeoSearch(render, unmount);
      const widget = customGeoSearch();

      const client = createFakeClient();
      const helper = createFakeHelper(client);

      const results = new SearchResults(helper.getState(), [
        {
          hits: [{ objectID: 123, _geoloc: { lat: 10, lng: 12 } }],
        },
      ]);

      widget.render({
        results,
        helper,
      });

      expect(render).toHaveBeenCalledTimes(1);
      expect(lastRenderArgs(render).hasMapMoveSinceLastRefine()).toBe(false);

      lastRenderArgs(render).setMapMoveSinceLastRefine();

      expect(render).toHaveBeenCalledTimes(2);
      expect(lastRenderArgs(render).hasMapMoveSinceLastRefine()).toBe(true);
      expect(firstRenderArgs(render).setMapMoveSinceLastRefine).toBe(
        lastRenderArgs(render).setMapMoveSinceLastRefine
      );
    });

    it('expect to set map move during render & trigger render only when value change', () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const customGeoSearch = connectGeoSearch(render, unmount);
      const widget = customGeoSearch();

      const client = createFakeClient();
      const helper = createFakeHelper(client);

      const results = new SearchResults(helper.getState(), [
        {
          hits: [{ objectID: 123, _geoloc: { lat: 10, lng: 12 } }],
        },
      ]);

      widget.render({
        results,
        helper,
      });

      expect(render).toHaveBeenCalledTimes(1);
      expect(lastRenderArgs(render).hasMapMoveSinceLastRefine()).toBe(false);

      lastRenderArgs(render).setMapMoveSinceLastRefine();

      expect(render).toHaveBeenCalledTimes(2);
      expect(lastRenderArgs(render).hasMapMoveSinceLastRefine()).toBe(true);

      lastRenderArgs(render).setMapMoveSinceLastRefine();

      expect(render).toHaveBeenCalledTimes(2);
      expect(lastRenderArgs(render).hasMapMoveSinceLastRefine()).toBe(true);
      expect(firstRenderArgs(render).setMapMoveSinceLastRefine).toBe(
        lastRenderArgs(render).setMapMoveSinceLastRefine
      );
    });
  });
});

describe('connectGeoSearch - getConfiguration', () => {
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

      const actual = widget.getConfiguration(new SearchParameters());

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

      const actual = widget.getConfiguration(new SearchParameters());

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

      const actual = widget.getConfiguration(
        new SearchParameters({
          aroundLatLngViaIP: false,
        })
      );

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

      const actual = widget.getConfiguration(
        new SearchParameters({
          aroundLatLng: '10, 12',
        })
      );

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

      const actual = widget.getConfiguration(new SearchParameters());

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

      const actual = widget.getConfiguration(
        new SearchParameters({
          aroundLatLngViaIP: false,
        })
      );

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

      const actual = widget.getConfiguration(
        new SearchParameters({
          aroundLatLng: '12, 12',
        })
      );

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

      const actual = widget.getConfiguration(
        new SearchParameters({
          aroundLatLngViaIP: true,
        })
      );

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

      const actual = widget.getConfiguration(new SearchParameters());

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

      const actual = widget.getConfiguration(
        new SearchParameters({
          aroundRadius: 500,
        })
      );

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

      const actual = widget.getConfiguration(new SearchParameters());

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

      const actual = widget.getConfiguration(
        new SearchParameters({
          aroundPrecision: 500,
        })
      );

      expect(actual).toEqual(expectation);
    });
  });
});

describe('connectGeoSearch - dispose', () => {
  describe('aroundLatLngViaIP', () => {
    it('expect reset aroundLatLngViaIP', () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const customGeoSearch = connectGeoSearch(render, unmount);
      const widget = customGeoSearch();

      const client = createFakeClient();
      const helper = createFakeHelper(client);

      helper.setState(widget.getConfiguration(new SearchParameters()));

      const expectation = {
        aroundLatLngViaIP: undefined,
      };

      const actual = widget.dispose({ state: helper.getState() });

      expect(unmount).toHaveBeenCalled();
      expect(actual).toMatchObject(expectation);
    });

    it("expect to not reset aroundLatLngViaIP when it's not set by the widget", () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const customGeoSearch = connectGeoSearch(render, unmount);
      const widget = customGeoSearch({
        enableGeolocationWithIP: false,
      });

      const client = createFakeClient();
      const helper = createFakeHelper(client);

      helper
        .setState(widget.getConfiguration(new SearchParameters()))
        .setQueryParameter('aroundLatLngViaIP', true);

      const expectation = {
        aroundLatLngViaIP: true,
      };

      const actual = widget.dispose({ state: helper.getState() });

      expect(unmount).toHaveBeenCalled();
      expect(actual).toMatchObject(expectation);
    });

    it('expect to not reset aroundLatLngViaIP when position is given', () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const customGeoSearch = connectGeoSearch(render, unmount);
      const widget = customGeoSearch({
        position: {
          lat: 10,
          lng: 12,
        },
      });

      const client = createFakeClient();
      const helper = createFakeHelper(client);

      helper
        .setState(widget.getConfiguration(new SearchParameters()))
        .setQueryParameter('aroundLatLngViaIP', true);

      const expectation = {
        aroundLatLngViaIP: true,
      };

      const actual = widget.dispose({ state: helper.getState() });

      expect(unmount).toHaveBeenCalled();
      expect(actual).toMatchObject(expectation);
    });
  });

  describe('aroundLatLng', () => {
    it('expect to reset aroundLatLng', () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const customGeoSearch = connectGeoSearch(render, unmount);
      const widget = customGeoSearch({
        position: {
          lat: 10,
          lng: 12,
        },
      });

      const client = createFakeClient();
      const helper = createFakeHelper(client);

      helper.setState(widget.getConfiguration(new SearchParameters()));

      const expectation = {
        aroundLatLng: undefined,
      };

      const actual = widget.dispose({ state: helper.getState() });

      expect(unmount).toHaveBeenCalled();
      expect(actual).toMatchObject(expectation);
    });

    it("expect to not reset aroundLatLng when it's not set by the widget", () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const customGeoSearch = connectGeoSearch(render, unmount);
      const widget = customGeoSearch();

      const client = createFakeClient();
      const helper = createFakeHelper(client);

      helper
        .setState(widget.getConfiguration(new SearchParameters()))
        .setQueryParameter('aroundLatLng', '10, 12');

      const expectation = {
        aroundLatLng: '10, 12',
      };

      const actual = widget.dispose({ state: helper.getState() });

      expect(unmount).toHaveBeenCalled();
      expect(actual).toMatchObject(expectation);
    });
  });

  describe('aroundRadius', () => {
    it('expect to reset aroundRadius', () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const customGeoSearch = connectGeoSearch(render, unmount);
      const widget = customGeoSearch({
        radius: 1000,
      });

      const client = createFakeClient();
      const helper = createFakeHelper(client);

      helper.setState(widget.getConfiguration(new SearchParameters()));

      const expectation = {
        aroundRadius: undefined,
      };

      const actual = widget.dispose({ state: helper.getState() });

      expect(unmount).toHaveBeenCalled();
      expect(actual).toMatchObject(expectation);
    });

    it("expect to not reset aroundRadius when it's not set by the widget", () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const customGeoSearch = connectGeoSearch(render, unmount);
      const widget = customGeoSearch();

      const client = createFakeClient();
      const helper = createFakeHelper(client);

      helper
        .setState(widget.getConfiguration(new SearchParameters()))
        .setQueryParameter('aroundRadius', 1000);

      const expectation = {
        aroundRadius: 1000,
      };

      const actual = widget.dispose({ state: helper.getState() });

      expect(unmount).toHaveBeenCalled();
      expect(actual).toMatchObject(expectation);
    });
  });

  describe('aroundPrecision', () => {
    it('expect to reset aroundPrecision', () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const customGeoSearch = connectGeoSearch(render, unmount);
      const widget = customGeoSearch({
        precision: 1000,
      });

      const client = createFakeClient();
      const helper = createFakeHelper(client);

      helper.setState(widget.getConfiguration(new SearchParameters()));

      const expectation = {
        aroundPrecision: undefined,
      };

      const actual = widget.dispose({ state: helper.getState() });

      expect(unmount).toHaveBeenCalled();
      expect(actual).toMatchObject(expectation);
    });

    it("expect to not reset aroundPrecision when it's not set by the widget", () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const customGeoSearch = connectGeoSearch(render, unmount);
      const widget = customGeoSearch();

      const client = createFakeClient();
      const helper = createFakeHelper(client);

      helper
        .setState(widget.getConfiguration(new SearchParameters()))
        .setQueryParameter('aroundPrecision', 1000);

      const expectation = {
        aroundPrecision: 1000,
      };

      const actual = widget.dispose({ state: helper.getState() });

      expect(unmount).toHaveBeenCalled();
      expect(actual).toMatchObject(expectation);
    });
  });
});
