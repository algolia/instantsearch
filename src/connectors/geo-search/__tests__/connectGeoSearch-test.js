import searchHelper, {
  SearchResults,
  SearchParameters,
} from 'algoliasearch-helper';
import connectGeoSearch from '../connectGeoSearch';

const createFakeClient = () => ({
  addAlgoliaAgent: () => {},
});

const createFakeHelper = client => {
  const helper = searchHelper(client);

  helper.search = jest.fn();

  return helper;
};

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
      helper,
      instantSearchInstance,
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
        instantSearchInstance,
      }),
      true
    );

    expect(render.mock.calls[0][0].isRefineOnMapMove()).toBe(true);
    expect(render.mock.calls[0][0].hasMapMoveSinceLastRefine()).toBe(false);
    expect(render.mock.calls[0][0].isRefinedWithMap()).toBe(false);

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
        refine: expect.any(Function),
        clearMapRefinement: expect.any(Function),
        toggleRefineOnMapMove: expect.any(Function),
        setMapMoveSinceLastRefine: expect.any(Function),
        widgetParams: {},
        instantSearchInstance,
      }),
      false
    );

    expect(render.mock.calls[1][0].isRefineOnMapMove()).toBe(true);
    expect(render.mock.calls[1][0].hasMapMoveSinceLastRefine()).toBe(false);
    expect(render.mock.calls[1][0].isRefinedWithMap()).toBe(false);
  });

  it('expect to be render with enableRefineOnMapMove disabled', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customGeoSearch = connectGeoSearch(render, unmount);
    const widget = customGeoSearch({
      enableRefineOnMapMove: false,
    });

    const client = createFakeClient();
    const helper = createFakeHelper(client);

    widget.init({
      helper,
    });

    expect(render).toHaveBeenCalledTimes(1);
    expect(render.mock.calls[0][0].isRefineOnMapMove()).toBe(false);

    widget.render({
      results: new SearchResults(helper.getState(), [
        {
          hits: [{ objectID: 123, _geoloc: { lat: 10, lng: 12 } }],
        },
      ]),
      helper,
    });

    expect(render).toHaveBeenCalledTimes(2);
    expect(render.mock.calls[1][0].isRefineOnMapMove()).toBe(false);
  });

  it('expect to be render with only hits with geoloc', () => {
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

    render.mock.calls[0][0].refine({ northEast, southWest });

    widget.render({
      results,
      helper,
    });

    expect(render).toHaveBeenCalledTimes(2);
    expect(render.mock.calls[1][0].hasMapMoveSinceLastRefine()).toBe(false);
    expect(render.mock.calls[1][0].isRefinedWithMap()).toBe(true);

    render.mock.calls[0][0].setMapMoveSinceLastRefine();

    expect(render).toHaveBeenCalledTimes(3);
    expect(render.mock.calls[2][0].hasMapMoveSinceLastRefine()).toBe(true);
    expect(render.mock.calls[2][0].isRefinedWithMap()).toBe(true);

    helper.setQueryParameter('aroundLatLng', '14,16');

    widget.render({
      results,
      helper,
    });

    expect(render).toHaveBeenCalledTimes(4);
    expect(render.mock.calls[3][0].hasMapMoveSinceLastRefine()).toBe(false);
    expect(render.mock.calls[3][0].isRefinedWithMap()).toBe(false);
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

    render.mock.calls[0][0].refine({ northEast, southWest });

    widget.render({
      results,
      helper,
    });

    expect(render).toHaveBeenCalledTimes(2);
    expect(render.mock.calls[1][0].hasMapMoveSinceLastRefine()).toBe(false);
    expect(render.mock.calls[1][0].isRefinedWithMap()).toBe(true);

    render.mock.calls[0][0].setMapMoveSinceLastRefine();

    expect(render).toHaveBeenCalledTimes(3);
    expect(render.mock.calls[2][0].hasMapMoveSinceLastRefine()).toBe(true);
    expect(render.mock.calls[2][0].isRefinedWithMap()).toBe(true);

    helper.setQueryParameter('aroundLatLng', '10,12');

    widget.render({
      results,
      helper,
    });

    expect(render).toHaveBeenCalledTimes(4);
    expect(render.mock.calls[3][0].hasMapMoveSinceLastRefine()).toBe(true);
    expect(render.mock.calls[3][0].isRefinedWithMap()).toBe(true);
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

    render.mock.calls[0][0].refine({ northEast, southWest });

    widget.render({
      results,
      helper,
    });

    expect(render).toHaveBeenCalledTimes(2);
    expect(render.mock.calls[1][0].hasMapMoveSinceLastRefine()).toBe(false);
    expect(render.mock.calls[1][0].isRefinedWithMap()).toBe(true);

    render.mock.calls[0][0].setMapMoveSinceLastRefine();

    expect(render).toHaveBeenCalledTimes(3);
    expect(render.mock.calls[2][0].hasMapMoveSinceLastRefine()).toBe(true);
    expect(render.mock.calls[2][0].isRefinedWithMap()).toBe(true);

    helper.setQueryParameter('insideBoundingBox');

    widget.render({
      results,
      helper,
    });

    expect(render).toHaveBeenCalledTimes(4);
    expect(render.mock.calls[2][0].hasMapMoveSinceLastRefine()).toBe(false);
    expect(render.mock.calls[1][0].isRefinedWithMap()).toBe(false);
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

    render.mock.calls[0][0].refine({ northEast, southWest });

    widget.render({
      results,
      helper,
    });

    expect(render).toHaveBeenCalledTimes(2);
    expect(render.mock.calls[1][0].hasMapMoveSinceLastRefine()).toBe(false);
    expect(render.mock.calls[1][0].isRefinedWithMap()).toBe(true);

    render.mock.calls[0][0].setMapMoveSinceLastRefine();

    expect(render).toHaveBeenCalledTimes(3);
    expect(render.mock.calls[2][0].hasMapMoveSinceLastRefine()).toBe(true);
    expect(render.mock.calls[2][0].isRefinedWithMap()).toBe(true);

    helper.setQueryParameter('insideBoundingBox', '12,14,16,18');

    widget.render({
      results,
      helper,
    });

    expect(render).toHaveBeenCalledTimes(4);
    expect(render.mock.calls[2][0].hasMapMoveSinceLastRefine()).toBe(true);
    expect(render.mock.calls[1][0].isRefinedWithMap()).toBe(true);
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
        helper,
      });

      expect(render).toHaveBeenCalledTimes(1);
      expect(render.mock.calls[0][0].hasMapMoveSinceLastRefine()).toBe(false);
      expect(render.mock.calls[0][0].isRefinedWithMap()).toBe(false);
      expect(helper.getState().insideBoundingBox).toBe(undefined);
      expect(helper.search).not.toHaveBeenCalled();

      render.mock.calls[0][0].refine({ northEast, southWest });

      widget.render({
        results,
        helper,
      });

      expect(render).toHaveBeenCalledTimes(2);
      expect(render.mock.calls[1][0].hasMapMoveSinceLastRefine()).toBe(false);
      expect(render.mock.calls[1][0].isRefinedWithMap()).toBe(true);
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
      expect(render.mock.calls[0][0].hasMapMoveSinceLastRefine()).toBe(false);
      expect(render.mock.calls[0][0].isRefinedWithMap()).toBe(false);
      expect(helper.getState().insideBoundingBox).toBe(undefined);
      expect(helper.search).not.toHaveBeenCalled();

      render.mock.calls[0][0].refine({ northEast, southWest });

      widget.render({
        results,
        helper,
      });

      expect(render).toHaveBeenCalledTimes(2);
      expect(render.mock.calls[1][0].hasMapMoveSinceLastRefine()).toBe(false);
      expect(render.mock.calls[1][0].isRefinedWithMap()).toBe(true);
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
        helper,
      });

      expect(render).toHaveBeenCalledTimes(1);
      expect(render.mock.calls[0][0].hasMapMoveSinceLastRefine()).toBe(false);
      expect(render.mock.calls[0][0].isRefinedWithMap()).toBe(false);
      expect(helper.getState().insideBoundingBox).toBe(undefined);
      expect(helper.search).not.toHaveBeenCalled();

      render.mock.calls[0][0].refine({ northEast, southWest });

      widget.render({
        results,
        helper,
      });

      expect(render).toHaveBeenCalledTimes(2);
      expect(render.mock.calls[1][0].hasMapMoveSinceLastRefine()).toBe(false);
      expect(render.mock.calls[1][0].isRefinedWithMap()).toBe(true);
      expect(helper.getState().insideBoundingBox).toEqual('12,10,40,42');
      expect(helper.search).toHaveBeenCalledTimes(1);

      render.mock.calls[0][0].clearMapRefinement();

      widget.render({
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
        results,
        helper,
      });

      expect(render).toHaveBeenCalledTimes(2);
      expect(render.mock.calls[1][0].hasMapMoveSinceLastRefine()).toBe(false);
      expect(render.mock.calls[1][0].isRefinedWithMap()).toBe(true);
      expect(helper.getState().insideBoundingBox).toEqual('12,10,40,42');
      expect(helper.search).toHaveBeenCalledTimes(1);

      render.mock.calls[0][0].clearMapRefinement();

      widget.render({
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

      widget.init({
        helper,
      });

      expect(render).toHaveBeenCalledTimes(1);
      expect(render.mock.calls[0][0].isRefineOnMapMove()).toBe(true);

      render.mock.calls[0][0].toggleRefineOnMapMove();

      expect(render).toHaveBeenCalledTimes(1);
      expect(render.mock.calls[0][0].isRefineOnMapMove()).toBe(false);

      widget.render({
        results: new SearchResults(helper.getState(), [
          {
            hits: [{ objectID: 123, _geoloc: { lat: 10, lng: 12 } }],
          },
        ]),
        helper,
      });

      expect(render).toHaveBeenCalledTimes(2);
      expect(render.mock.calls[1][0].isRefineOnMapMove()).toBe(false);
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

      widget.render({
        results: new SearchResults(helper.getState(), [
          {
            hits: [{ objectID: 123, _geoloc: { lat: 10, lng: 12 } }],
          },
        ]),
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

  describe('setMapMoveSinceLastRefine', () => {
    it('expect to set map move during init', () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const customGeoSearch = connectGeoSearch(render, unmount);
      const widget = customGeoSearch();

      const client = createFakeClient();
      const helper = createFakeHelper(client);

      widget.init({
        helper,
      });

      expect(render).toHaveBeenCalledTimes(1);
      expect(render.mock.calls[0][0].hasMapMoveSinceLastRefine()).toBe(false);

      render.mock.calls[0][0].setMapMoveSinceLastRefine();

      expect(render).toHaveBeenCalledTimes(1);
      expect(render.mock.calls[0][0].hasMapMoveSinceLastRefine()).toBe(true);

      widget.render({
        results: new SearchResults(helper.getState(), [
          {
            hits: [{ objectID: 123, _geoloc: { lat: 10, lng: 12 } }],
          },
        ]),
        helper,
      });

      expect(render).toHaveBeenCalledTimes(2);
      expect(render.mock.calls[1][0].hasMapMoveSinceLastRefine()).toBe(true);
      expect(render.mock.calls[0][0].setMapMoveSinceLastRefine).toBe(
        render.mock.calls[1][0].setMapMoveSinceLastRefine
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
      expect(render.mock.calls[0][0].hasMapMoveSinceLastRefine()).toBe(false);

      render.mock.calls[0][0].setMapMoveSinceLastRefine();

      expect(render).toHaveBeenCalledTimes(2);
      expect(render.mock.calls[1][0].hasMapMoveSinceLastRefine()).toBe(true);
      expect(render.mock.calls[0][0].setMapMoveSinceLastRefine).toBe(
        render.mock.calls[1][0].setMapMoveSinceLastRefine
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
      expect(render.mock.calls[0][0].hasMapMoveSinceLastRefine()).toBe(false);

      render.mock.calls[0][0].setMapMoveSinceLastRefine();

      expect(render).toHaveBeenCalledTimes(2);
      expect(render.mock.calls[1][0].hasMapMoveSinceLastRefine()).toBe(true);
      expect(render.mock.calls[0][0].setMapMoveSinceLastRefine).toBe(
        render.mock.calls[1][0].setMapMoveSinceLastRefine
      );

      render.mock.calls[0][0].setMapMoveSinceLastRefine();

      expect(render).toHaveBeenCalledTimes(2);
      expect(render.mock.calls[1][0].hasMapMoveSinceLastRefine()).toBe(true);
      expect(render.mock.calls[0][0].setMapMoveSinceLastRefine).toBe(
        render.mock.calls[1][0].setMapMoveSinceLastRefine
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
