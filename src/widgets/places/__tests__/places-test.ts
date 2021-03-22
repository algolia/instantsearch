import algoliasearchHelper, { SearchParameters } from 'algoliasearch-helper';
import algoliaPlaces from 'places.js';
import places from '../places';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import { createInitOptions } from '../../../../test/mock/createWidget';
import { SearchClient } from '../../../types';

jest.mock('places.js', () => {
  const module = jest.fn(() => {
    const instance = {
      on: jest.fn(),
      setVal: jest.fn(),
      close: jest.fn(),
    };
    (module as any).__instance = instance;

    return instance;
  });

  return module;
});

const createFakeHelper = (
  searchClient: SearchClient,
  searchParameters: Partial<SearchParameters> = {}
) => {
  const helper = algoliasearchHelper(
    searchClient,
    'indexName',
    searchParameters
  );

  helper.search = jest.fn();

  return helper;
};

describe('places', () => {
  const container = document.createElement('input');
  const defaultOptions = {
    placesReference: algoliaPlaces,
    container,
  };

  describe('Usage', () => {
    test('creates a places instance', () => {
      const searchClient = createSearchClient();
      const helper = createFakeHelper(searchClient);
      const widget = places({
        ...defaultOptions,
        defaultPosition: ['1', '1'],
      });

      widget.init!(createInitOptions({ helper }));

      expect(algoliaPlaces).toHaveBeenCalledTimes(1);
      expect(algoliaPlaces).toHaveBeenCalledWith({ container });
    });

    test('throws without parameters', () => {
      // @ts-expect-error
      expect(() => places()).toThrowErrorMatchingInlineSnapshot(
        `"The \`placesReference\` option requires a valid Places.js reference."`
      );
    });
  });

  describe('Lifecycle', () => {
    describe('init', () => {
      test('does not call `setQueryParameter` during the init step', () => {
        // Using `setQueryParameter` to change a filter value during the init step
        // has unintented consequences such as resetting the pagination to 0.
        const searchClient = createSearchClient();
        const helper = createFakeHelper(searchClient);
        const widget = places(defaultOptions);

        helper.setQueryParameter = jest.fn();
        widget.init!(createInitOptions({ helper }));

        expect(helper.setQueryParameter).toHaveBeenCalledTimes(0);
      });

      test('configures `aroundLatLng` on change event', () => {
        const searchClient = createSearchClient();
        const helper = createFakeHelper(searchClient);
        const widget = places({
          ...defaultOptions,
        });

        widget.init!(createInitOptions({ helper }));

        const [
          changeEventName,
          changeEventListener,
        ] = (algoliaPlaces as any).__instance.on.mock.calls[0];

        expect(changeEventName).toEqual('change');

        changeEventListener({
          suggestion: {
            latlng: {
              lat: '123',
              lng: '456',
            },
          },
        });

        expect(helper.search).toHaveBeenCalledTimes(1);
        expect(helper.state).toEqual(
          new SearchParameters({
            index: 'indexName',
            aroundLatLng: '123,456',
            aroundLatLngViaIP: false,
            insideBoundingBox: undefined,
          })
        );
      });

      test('configures `aroundLatLng` with `defaultPosition` on clear event', () => {
        const searchClient = createSearchClient();
        const helper = createFakeHelper(searchClient, {
          aroundLatLngViaIP: true,
        });
        const widget = places({
          ...defaultOptions,
          defaultPosition: ['2', '2'],
        });

        widget.init!(createInitOptions({ helper }));

        const [
          clearEventName,
          clearEventListener,
        ] = (algoliaPlaces as any).__instance.on.mock.calls[1];

        expect(clearEventName).toEqual('clear');

        clearEventListener();

        expect(helper.search).toHaveBeenCalledTimes(1);
        expect(helper.state).toEqual(
          new SearchParameters({
            index: 'indexName',
            aroundLatLngViaIP: false,
            aroundLatLng: '2,2',
            insideBoundingBox: undefined,
          })
        );
      });

      test('restores `aroundLatLngViaIP` without `defaultPosition` on clear event', () => {
        const searchClient = createSearchClient();
        const helper = createFakeHelper(searchClient, {
          aroundLatLngViaIP: true,
        });
        const widget = places({
          ...defaultOptions,
        });

        widget.init!(createInitOptions({ helper }));
        // Trigger the initialization of `aroundLatLngViaIP`.
        widget.getWidgetSearchParameters!(helper.state, { uiState: {} });

        expect(helper.state.aroundLatLngViaIP).toBe(true);

        const [
          changeEventName,
          changeEventListener,
        ] = (algoliaPlaces as any).__instance.on.mock.calls[0];

        expect(changeEventName).toEqual('change');

        changeEventListener({
          suggestion: {
            latlng: {
              lat: '123',
              lng: '456',
            },
          },
        });

        expect(helper.search).toHaveBeenCalledTimes(1);
        expect(helper.state.aroundLatLngViaIP).toBe(false);

        const [
          clearEventName,
          clearEventListener,
        ] = (algoliaPlaces as any).__instance.on.mock.calls[1];

        expect(clearEventName).toEqual('clear');

        clearEventListener();

        expect(helper.search).toHaveBeenCalledTimes(2);
        expect(helper.state.aroundLatLngViaIP).toBe(true);
      });
    });

    describe('getWidgetSearchParameters', () => {
      test('returns default search parameters with default UI state', () => {
        const searchClient = createSearchClient();
        const helper = createFakeHelper(searchClient);
        const widget = places({
          ...defaultOptions,
        });

        widget.init!(createInitOptions({ helper }));

        const nextSearchParameters = widget.getWidgetSearchParameters!(
          helper.state,
          {
            uiState: {},
          }
        );

        expect(nextSearchParameters).toEqual(
          new SearchParameters({
            index: 'indexName',
            aroundLatLngViaIP: false,
          })
        );
      });

      test('returns the search parameters with values from the UI state', () => {
        const searchClient = createSearchClient();
        const helper = createFakeHelper(searchClient);
        const widget = places({
          ...defaultOptions,
        });

        widget.init!(createInitOptions({ helper }));

        const nextSearchParameters = widget.getWidgetSearchParameters!(
          helper.state,
          {
            uiState: {
              places: {
                query: 'Paris, Île-de-France, France',
                position: '48.8546,2.3477',
              },
            },
          }
        );

        expect(nextSearchParameters).toEqual(
          new SearchParameters({
            index: 'indexName',
            aroundLatLng: '48.8546,2.3477',
            aroundLatLngViaIP: false,
          })
        );
      });

      test('returns the search parameters with values from the UI state if using `defaultPosition`', () => {
        const searchClient = createSearchClient();
        const helper = createFakeHelper(searchClient);
        const widget = places({
          ...defaultOptions,
          defaultPosition: ['1', '1'],
        });

        widget.init!(createInitOptions({ helper }));

        const nextSearchParameters = widget.getWidgetSearchParameters!(
          helper.state,
          {
            uiState: {
              places: {
                query: 'Paris, Île-de-France, France',
                position: '48.8546,2.3477',
              },
            },
          }
        );

        expect(nextSearchParameters).toEqual(
          new SearchParameters({
            index: 'indexName',
            aroundLatLng: '48.8546,2.3477',
            aroundLatLngViaIP: false,
          })
        );
      });

      test('returns the search parameters with `defaultPosition` when empty UI state', () => {
        const searchClient = createSearchClient();
        const helper = createFakeHelper(searchClient);
        const widget = places({
          ...defaultOptions,
          defaultPosition: ['1', '1'],
        });

        widget.init!(createInitOptions({ helper }));

        const nextSearchParameters = widget.getWidgetSearchParameters!(
          helper.state,
          {
            uiState: {},
          }
        );

        expect(nextSearchParameters).toEqual(
          new SearchParameters({
            index: 'indexName',
            aroundLatLng: '1,1',
            aroundLatLngViaIP: false,
          })
        );
      });

      test('restores `aroundLatLngViaIP` on clear event', () => {
        const searchClient = createSearchClient();
        const helper = createFakeHelper(searchClient);
        const widget = places({
          ...defaultOptions,
        });

        const previousSearchParameters = new SearchParameters({
          aroundLatLngViaIP: true,
        });

        const uiState = {
          places: {
            query: 'Paris',
            position: '123,123',
          },
        };

        widget.getWidgetSearchParameters!(previousSearchParameters, {
          uiState,
        });

        widget.init!(createInitOptions({ helper }));

        expect(helper.state.aroundLatLngViaIP).toBeUndefined();

        const [
          ,
          clearEventListener,
        ] = (algoliaPlaces as any).__instance.on.mock.calls[1];

        clearEventListener();

        expect(helper.search).toHaveBeenCalledTimes(1);
        expect(helper.state.aroundLatLngViaIP).toBe(true);
      });

      test('should close the dropdown', () => {
        const searchClient = createSearchClient();
        const helper = createFakeHelper(searchClient);
        const widget = places({
          ...defaultOptions,
        });

        widget.init!(createInitOptions({ helper }));

        expect((algoliaPlaces as any).__instance.close).toHaveBeenCalledTimes(
          0
        );

        widget.getWidgetSearchParameters!(helper.state, {
          uiState: {
            places: {
              query: 'Paris, Île-de-France, France',
              position: '48.8546,2.3477',
            },
          },
        });

        expect((algoliaPlaces as any).__instance.close).toHaveBeenCalledTimes(
          1
        );
      });
    });

    describe('getWidgetUiState', () => {
      test('returns the default state empty', () => {
        const searchClient = createSearchClient();
        const helper = createFakeHelper(searchClient);
        const widget = places({
          ...defaultOptions,
        });

        const previousUiState = {};
        const nextUiState = widget.getWidgetUiState!(previousUiState, {
          helper,
          searchParameters: helper.state,
        });

        expect(nextUiState).toEqual({});
      });

      test('returns the state with `position` when using `defaultPosition`', () => {
        const searchClient = createSearchClient();
        const helper = createFakeHelper(searchClient);
        const widget = places({
          ...defaultOptions,
          defaultPosition: ['2', '2'],
        });

        const previousUiState = {};
        const nextUiState = widget.getWidgetUiState!(previousUiState, {
          helper,
          searchParameters: helper.state,
        });

        expect(nextUiState).toEqual({});
      });

      test('returns an exhaustive state on `change`', () => {
        const searchClient = createSearchClient();
        const helper = createFakeHelper(searchClient);
        const widget = places({
          ...defaultOptions,
        });

        widget.init!(createInitOptions({ helper }));

        const [
          changeEventName,
          changeEventListener,
        ] = (algoliaPlaces as any).__instance.on.mock.calls[0];

        expect(changeEventName).toEqual('change');

        changeEventListener({
          suggestion: {
            value: 'Paris',
            latlng: {
              lat: '123',
              lng: '456',
            },
          },
        });

        const previousUiState = {};
        const nextUiState = widget.getWidgetUiState!(previousUiState, {
          helper,
          searchParameters: helper.state,
        });

        expect(nextUiState).toEqual({
          places: {
            query: 'Paris',
            position: '123,456',
          },
        });
      });

      test('returns an empty state on `clear`', () => {
        const searchClient = createSearchClient();
        const helper = createFakeHelper(searchClient);
        const widget = places({
          ...defaultOptions,
        });

        widget.init!(createInitOptions({ helper }));

        const [
          clearEventName,
          clearEventListener,
        ] = (algoliaPlaces as any).__instance.on.mock.calls[1];

        expect(clearEventName).toEqual('clear');

        clearEventListener();

        const previousUiState = {};
        const nextUiState = widget.getWidgetUiState!(previousUiState, {
          helper,
          searchParameters: helper.state,
        });

        expect(nextUiState).toEqual({});
      });

      test('returns an empty state on `clear` with `defaultPosition`', () => {
        const searchClient = createSearchClient();
        const helper = createFakeHelper(searchClient);
        const widget = places({
          ...defaultOptions,
          defaultPosition: ['2', '2'],
        });

        widget.init!(createInitOptions({ helper }));

        const [
          clearEventName,
          clearEventListener,
        ] = (algoliaPlaces as any).__instance.on.mock.calls[1];

        expect(clearEventName).toEqual('clear');

        clearEventListener();

        const previousUiState = {};
        const nextUiState = widget.getWidgetUiState!(previousUiState, {
          helper,
          searchParameters: helper.state,
        });

        expect(nextUiState).toEqual({});
      });
    });
  });
});
