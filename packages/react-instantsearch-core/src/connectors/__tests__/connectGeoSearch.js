import { SearchResults, SearchParameters } from 'algoliasearch-helper';

import connector from '../connectGeoSearch';

jest.mock('../../core/createConnector', () => (x) => x);

describe('connectGeoSearch', () => {
  const empty = {};

  describe('single index', () => {
    const contextValue = {
      mainTargetedIndex: 'index',
    };

    const createSingleIndexSearchResults = (hits = [], state) => ({
      results: new SearchResults(new SearchParameters(state), [
        {
          hits,
        },
      ]),
    });

    describe('getProvidedProps', () => {
      it('expect to return default provided props', () => {
        const props = { contextValue };
        const searchState = {};
        const searchResults = empty;

        const actual = connector.getProvidedProps(
          props,
          searchState,
          searchResults
        );

        const expectation = {
          hits: [],
          position: undefined,
          currentRefinement: undefined,
          isRefinedWithMap: false,
        };

        expect(actual).toEqual(expectation);
      });

      describe('hits', () => {
        it('expect to return hits when we have results', () => {
          const hits = [
            { objectID: '123', _geoloc: true },
            { objectID: '456', _geoloc: true },
            { objectID: '789', _geoloc: true },
          ];

          const props = { contextValue };
          const searchState = {};
          const searchResults = createSingleIndexSearchResults(hits);

          const actual = connector.getProvidedProps(
            props,
            searchState,
            searchResults
          );

          const expectation = [
            { objectID: '123', _geoloc: true },
            { objectID: '456', _geoloc: true },
            { objectID: '789', _geoloc: true },
          ];

          expect(actual.hits).toEqual(expectation);
        });

        it('expect to return hits with only "_geoloc" when we have results', () => {
          const hits = [
            { objectID: '123', _geoloc: true },
            { objectID: '456', _geoloc: false },
            { objectID: '789', _geoloc: true },
          ];

          const props = { contextValue };
          const searchState = {};
          const searchResults = createSingleIndexSearchResults(hits);

          const actual = connector.getProvidedProps(
            props,
            searchState,
            searchResults
          );

          const expectation = [
            { objectID: '123', _geoloc: true },
            { objectID: '789', _geoloc: true },
          ];

          expect(actual.hits).toEqual(expectation);
        });

        it("expect to return empty hits when we don't have results", () => {
          const props = { contextValue };
          const searchState = {};
          const searchResults = empty;

          const actual = connector.getProvidedProps(
            props,
            searchState,
            searchResults
          );

          const expectation = [];

          expect(actual.hits).toEqual(expectation);
        });
      });

      describe('position', () => {
        it('expect to return the position from the searchState (aroundLatLng)', () => {
          const props = { contextValue };
          const searchResults = createSingleIndexSearchResults();
          const searchState = {
            aroundLatLng: {
              lat: 10,
              lng: 12,
            },
          };

          const actual = connector.getProvidedProps(
            props,
            searchState,
            searchResults
          );

          expect(actual.position).toEqual({
            lat: 10,
            lng: 12,
          });
        });

        it('expect to return the position from the searchState (configure.aroundLatLng)', () => {
          const props = { contextValue };
          const searchResults = createSingleIndexSearchResults();
          const searchState = {
            configure: {
              aroundLatLng: '10, 12',
            },
          };

          const actual = connector.getProvidedProps(
            props,
            searchState,
            searchResults
          );

          expect(actual.position).toEqual({
            lat: 10,
            lng: 12,
          });
        });

        it('expect to return the position from the SearchResults', () => {
          const props = { contextValue };
          const searchState = {};
          const searchResults = createSingleIndexSearchResults([], {
            aroundLatLng: '10, 12',
          });

          const actual = connector.getProvidedProps(
            props,
            searchState,
            searchResults
          );

          expect(actual.position).toEqual({
            lat: 10,
            lng: 12,
          });
        });

        it('expect to return undefined from an empty searchState', () => {
          const props = { contextValue };
          const searchState = {};
          const searchResults = createSingleIndexSearchResults();

          const actual = connector.getProvidedProps(
            props,
            searchState,
            searchResults
          );

          expect(actual.position).toBe(undefined);
        });

        it('expect to return undefined with the default refinement', () => {
          const searchState = {};
          const searchResults = createSingleIndexSearchResults();
          const props = {
            contextValue,
            defaultRefinement: {
              northEast: {
                lat: 10,
                lng: 12,
              },
              southWest: {
                lat: 12,
                lng: 14,
              },
            },
          };

          const actual = connector.getProvidedProps(
            props,
            searchState,
            searchResults
          );

          expect(actual.position).toBe(undefined);
        });
      });

      describe('currentRefinement', () => {
        it('expect to return the boundingBox from the searchState', () => {
          const props = { contextValue };
          const searchResults = createSingleIndexSearchResults();
          const searchState = {
            boundingBox: {
              northEast: {
                lat: 10,
                lng: 12,
              },
              southWest: {
                lat: 12,
                lng: 14,
              },
            },
          };

          const actual = connector.getProvidedProps(
            props,
            searchState,
            searchResults
          );

          expect(actual.currentRefinement).toEqual({
            northEast: {
              lat: 10,
              lng: 12,
            },
            southWest: {
              lat: 12,
              lng: 14,
            },
          });
        });

        it('expect to return the boundingBox from the searchState with string values', () => {
          const props = { contextValue };
          const searchResults = createSingleIndexSearchResults();
          const searchState = {
            boundingBox: {
              northEast: {
                lat: '10.12',
                lng: 12.1,
              },
              southWest: {
                lat: 12.14,
                lng: '14.12',
              },
            },
          };

          const actual = connector.getProvidedProps(
            props,
            searchState,
            searchResults
          );

          expect(actual.currentRefinement).toEqual({
            northEast: {
              lat: 10.12,
              lng: 12.1,
            },
            southWest: {
              lat: 12.14,
              lng: 14.12,
            },
          });
        });

        it('expect to return the boundingBox from the SearchResults', () => {
          const props = { contextValue };
          const searchState = {};
          const searchResults = createSingleIndexSearchResults([], {
            insideBoundingBox: '10, 12, 12, 14',
          });

          const actual = connector.getProvidedProps(
            props,
            searchState,
            searchResults
          );

          expect(actual.currentRefinement).toEqual({
            northEast: {
              lat: 10,
              lng: 12,
            },
            southWest: {
              lat: 12,
              lng: 14,
            },
          });
        });

        it('expect to return the default refinement', () => {
          const searchState = {};
          const searchResults = createSingleIndexSearchResults();
          const props = {
            contextValue,
            defaultRefinement: {
              northEast: {
                lat: 10,
                lng: 12,
              },
              southWest: {
                lat: 12,
                lng: 14,
              },
            },
          };

          const actual = connector.getProvidedProps(
            props,
            searchState,
            searchResults
          );

          expect(actual.currentRefinement).toEqual({
            northEast: {
              lat: 10,
              lng: 12,
            },
            southWest: {
              lat: 12,
              lng: 14,
            },
          });
        });

        it('expect to return undefined from an empty searchState', () => {
          const props = { contextValue };
          const searchState = {};
          const searchResults = createSingleIndexSearchResults();

          const actual = connector.getProvidedProps(
            props,
            searchState,
            searchResults
          );

          expect(actual.currentRefinement).toBe(undefined);
        });
      });

      describe('isRefinedWithMap', () => {
        it("expect to return true when it's refined with the map (from the searchState)", () => {
          const hits = [
            { objectID: '123', _geoloc: true },
            { objectID: '456', _geoloc: true },
            { objectID: '789', _geoloc: true },
          ];

          const props = { contextValue };
          const searchResults = createSingleIndexSearchResults(hits);
          const searchState = {
            boundingBox: {
              northEast: {
                lat: 10,
                lng: 12,
              },
              southWest: {
                lat: 12,
                lng: 14,
              },
            },
          };

          const actual = connector.getProvidedProps(
            props,
            searchState,
            searchResults
          );

          expect(actual.isRefinedWithMap).toBe(true);
        });

        it("expect to return true when it's refined with the map (from the searchParameters)", () => {
          const hits = [
            { objectID: '123', _geoloc: true },
            { objectID: '456', _geoloc: true },
            { objectID: '789', _geoloc: true },
          ];

          const props = { contextValue };
          const searchState = {};
          const searchResults = createSingleIndexSearchResults(hits, {
            insideBoundingBox: '10, 12, 12, 14',
          });

          const actual = connector.getProvidedProps(
            props,
            searchState,
            searchResults
          );

          expect(actual.isRefinedWithMap).toBe(true);
        });

        it("expect to return false when it's not refined with the map", () => {
          const hits = [
            { objectID: '123', _geoloc: true },
            { objectID: '456', _geoloc: true },
            { objectID: '789', _geoloc: true },
          ];

          const props = { contextValue };
          const searchState = {};
          const searchResults = createSingleIndexSearchResults(hits);

          const actual = connector.getProvidedProps(
            props,
            searchState,
            searchResults
          );

          expect(actual.isRefinedWithMap).toBe(false);
        });
      });
    });

    describe('refine', () => {
      it('expect to set the boundingBox when boundingBox is provided', () => {
        const props = { contextValue };
        const searchState = {};
        const nextRefinement = {
          northEast: {
            lat: 10,
            lng: 12,
          },
          southWest: {
            lat: 12,
            lng: 14,
          },
        };

        const actual = connector.refine(props, searchState, nextRefinement);

        expect(actual).toEqual({
          page: 1,
          boundingBox: {
            northEast: {
              lat: 10,
              lng: 12,
            },
            southWest: {
              lat: 12,
              lng: 14,
            },
          },
        });
      });

      it('expect to replace the previous value when boundingBox is provided', () => {
        const props = { contextValue };
        const searchState = {
          boundingBox: {
            northEast: {
              lat: 8,
              lng: 10,
            },
            southWest: {
              lat: 10,
              lng: 12,
            },
          },
        };

        const nextRefinement = {
          northEast: {
            lat: 10,
            lng: 12,
          },
          southWest: {
            lat: 12,
            lng: 14,
          },
        };

        const actual = connector.refine(props, searchState, nextRefinement);

        expect(actual).toEqual({
          page: 1,
          boundingBox: {
            northEast: {
              lat: 10,
              lng: 12,
            },
            southWest: {
              lat: 12,
              lng: 14,
            },
          },
        });
      });

      it('expect to clear the previous value when boundingBox is omit', () => {
        const props = { contextValue };
        const searchState = {
          boundingBox: {
            northEast: {
              lat: 8,
              lng: 10,
            },
            southWest: {
              lat: 10,
              lng: 12,
            },
          },
        };

        const actual = connector.refine(props, searchState);

        const expectation = {
          page: 1,
        };

        expect(actual).toEqual(expectation);
      });
    });

    describe('getSearchParameters', () => {
      it('expect to set the parameter "insideBoundingBox" when boundingBox is provided', () => {
        const searchParameters = new SearchParameters();
        const props = { contextValue };
        const searchState = {
          boundingBox: {
            northEast: {
              lat: 10,
              lng: 12,
            },
            southWest: {
              lat: 12,
              lng: 14,
            },
          },
        };

        const actual = connector.getSearchParameters(
          searchParameters,
          props,
          searchState
        );

        const expectation = '10,12,12,14';

        expect(actual.insideBoundingBox).toEqual(expectation);
      });

      it('expect to return the given searchParameters when boundingBox is omit', () => {
        const searchParameters = new SearchParameters();
        const props = { contextValue };
        const searchState = {};

        const actual = connector.getSearchParameters(
          searchParameters,
          props,
          searchState
        );

        expect(actual).toEqual(searchParameters);
      });
    });

    describe('cleanUp', () => {
      it('expect to remove the refinement from the searchState when boundingBox is provided', () => {
        const props = { contextValue };
        const searchState = {
          query: 'studio',
          boundingBox: {
            northEast: {
              lat: 10,
              lng: 12,
            },
            southWest: {
              lat: 12,
              lng: 14,
            },
          },
        };

        const actual = connector.cleanUp(props, searchState);

        const expectation = {
          query: 'studio',
        };

        expect(actual).toEqual(expectation);
      });

      it('expect to return the given searchState when boundingBox is omit', () => {
        const props = { contextValue };
        const searchState = {
          query: 'studio',
        };

        const actual = connector.cleanUp(props, searchState);

        const expectation = {
          query: 'studio',
        };

        expect(actual).toEqual(expectation);
      });
    });

    describe('getMetadata', () => {
      it('expect to return the meta when boundingBox is provided', () => {
        const props = { contextValue };
        const searchState = {
          boundingBox: {
            northEast: {
              lat: 10,
              lng: 12,
            },
            southWest: {
              lat: 12,
              lng: 14,
            },
          },
        };

        const actual = connector.getMetadata(props, searchState);

        const expectation = {
          id: 'boundingBox',
          index: 'index',
          items: [
            {
              label: 'boundingBox: 10,12,12,14',
              value: expect.any(Function),
              currentRefinement: {
                northEast: {
                  lat: 10,
                  lng: 12,
                },
                southWest: {
                  lat: 12,
                  lng: 14,
                },
              },
            },
          ],
        };

        expect(actual).toEqual(expectation);
      });

      it('expect to return an empty meta when boundingBox is omit', () => {
        const props = { contextValue };
        const searchState = {};

        const actual = connector.getMetadata(props, searchState);

        expect(actual).toEqual({
          id: 'boundingBox',
          index: 'index',
          items: [],
        });
      });

      it('expect to clear the boundingBox when value is called', () => {
        const props = { contextValue };
        const searchState = {
          query: 'studio',
          boundingBox: {
            northEast: {
              lat: 10,
              lng: 12,
            },
            southWest: {
              lat: 12,
              lng: 14,
            },
          },
        };

        const metadata = connector.getMetadata(props, searchState);
        const actual = metadata.items[0].value(searchState);

        expect(actual).toEqual({
          query: 'studio',
          boundingBox: {},
          page: 1,
        });
      });
    });
  });

  describe('multi index', () => {
    const contextValue = { mainTargetedIndex: 'first' };
    const indexContextValue = { targetedIndex: 'second' };

    const createMultiIndexSearchState = (state = {}) => ({
      indices: {
        second: state,
      },
    });

    const createMultiIndexSearchResults = (hits = [], state) => ({
      results: {
        second: new SearchResults(new SearchParameters(state), [
          {
            hits,
          },
        ]),
      },
    });

    describe('getProvidedProps', () => {
      it('expect to return default provided props', () => {
        const searchState = createMultiIndexSearchState();
        const props = { contextValue, indexContextValue };

        const searchResults = empty;

        const actual = connector.getProvidedProps(
          props,
          searchState,
          searchResults
        );

        const expectation = {
          hits: [],
          position: undefined,
          currentRefinement: undefined,
          isRefinedWithMap: false,
        };

        expect(actual).toEqual(expectation);
      });

      describe('hits', () => {
        it('expect to return hits when we have results', () => {
          const hits = [
            { objectID: '123', _geoloc: true },
            { objectID: '456', _geoloc: true },
            { objectID: '789', _geoloc: true },
          ];

          const props = { contextValue, indexContextValue };
          const searchState = createMultiIndexSearchState();
          const searchResults = createMultiIndexSearchResults(hits);

          const actual = connector.getProvidedProps(
            props,
            searchState,
            searchResults
          );

          const expectation = [
            { objectID: '123', _geoloc: true },
            { objectID: '456', _geoloc: true },
            { objectID: '789', _geoloc: true },
          ];

          expect(actual.hits).toEqual(expectation);
        });

        it('expect to return hits with only "_geoloc" when we have results', () => {
          const hits = [
            { objectID: '123', _geoloc: true },
            { objectID: '456', _geoloc: false },
            { objectID: '789', _geoloc: true },
          ];

          const props = { contextValue, indexContextValue };
          const searchState = createMultiIndexSearchState();
          const searchResults = createMultiIndexSearchResults(hits);

          const actual = connector.getProvidedProps(
            props,
            searchState,
            searchResults
          );

          const expectation = [
            { objectID: '123', _geoloc: true },
            { objectID: '789', _geoloc: true },
          ];

          expect(actual.hits).toEqual(expectation);
        });

        it("expect to return empty hits when we don't have results", () => {
          const props = { contextValue, indexContextValue };
          const searchState = createMultiIndexSearchState();
          const searchResults = empty;

          const actual = connector.getProvidedProps(
            props,
            searchState,
            searchResults
          );

          const expectation = [];

          expect(actual.hits).toEqual(expectation);
        });
      });

      describe('position', () => {
        it('expect to return the position from the searchState (aroundLatLng)', () => {
          const props = { contextValue, indexContextValue };
          const searchResults = createMultiIndexSearchResults();
          const searchState = createMultiIndexSearchState({
            aroundLatLng: {
              lat: 10,
              lng: 12,
            },
          });

          const actual = connector.getProvidedProps(
            props,
            searchState,
            searchResults
          );

          expect(actual.position).toEqual({
            lat: 10,
            lng: 12,
          });
        });

        it('expect to return the position from the searchState (configure.aroungLatLng)', () => {
          const props = { contextValue, indexContextValue };
          const searchResults = createMultiIndexSearchResults();
          const searchState = createMultiIndexSearchState({
            configure: {
              aroundLatLng: '10, 12',
            },
          });

          const actual = connector.getProvidedProps(
            props,
            searchState,
            searchResults
          );

          expect(actual.position).toEqual({
            lat: 10,
            lng: 12,
          });
        });

        it('expect to return undefined from an empty searchState', () => {
          const props = { contextValue, indexContextValue };
          const searchState = createMultiIndexSearchState();
          const searchResults = createMultiIndexSearchResults();

          const actual = connector.getProvidedProps(
            props,
            searchState,
            searchResults
          );

          expect(actual.position).toBe(undefined);
        });

        it('expect to return undefined with the default refinement', () => {
          const searchState = createMultiIndexSearchState();
          const searchResults = createMultiIndexSearchResults();
          const props = {
            defaultRefinement: {
              northEast: {
                lat: 10,
                lng: 12,
              },
              southWest: {
                lat: 12,
                lng: 14,
              },
            },
            contextValue,
            indexContextValue,
          };

          const actual = connector.getProvidedProps(
            props,
            searchState,
            searchResults
          );

          expect(actual.position).toBe(undefined);
        });
      });

      describe('currentRefinement', () => {
        it('expect to return the boundingBox from the searchState', () => {
          const props = { contextValue, indexContextValue };
          const searchResults = createMultiIndexSearchResults();
          const searchState = createMultiIndexSearchState({
            boundingBox: {
              northEast: {
                lat: 10,
                lng: 12,
              },
              southWest: {
                lat: 12,
                lng: 14,
              },
            },
          });

          const actual = connector.getProvidedProps(
            props,
            searchState,
            searchResults
          );

          expect(actual.currentRefinement).toEqual({
            northEast: {
              lat: 10,
              lng: 12,
            },
            southWest: {
              lat: 12,
              lng: 14,
            },
          });
        });

        it('expect to return the boundingBox from the searchState with string values', () => {
          const props = { contextValue, indexContextValue };
          const searchResults = createMultiIndexSearchResults();
          const searchState = createMultiIndexSearchState({
            boundingBox: {
              northEast: {
                lat: '10.12',
                lng: 12.1,
              },
              southWest: {
                lat: 12.14,
                lng: '14.12',
              },
            },
          });

          const actual = connector.getProvidedProps(
            props,
            searchState,
            searchResults
          );

          expect(actual.currentRefinement).toEqual({
            northEast: {
              lat: 10.12,
              lng: 12.1,
            },
            southWest: {
              lat: 12.14,
              lng: 14.12,
            },
          });
        });

        it('expect to return the boundingBox from the SearchResults', () => {
          const props = { contextValue, indexContextValue };
          const searchState = {};
          const searchResults = createMultiIndexSearchResults([], {
            insideBoundingBox: '10, 12, 12, 14',
          });

          const actual = connector.getProvidedProps(
            props,
            searchState,
            searchResults
          );

          expect(actual.currentRefinement).toEqual({
            northEast: {
              lat: 10,
              lng: 12,
            },
            southWest: {
              lat: 12,
              lng: 14,
            },
          });
        });

        it('expect to return the default refinement', () => {
          const searchState = createMultiIndexSearchState();
          const searchResults = createMultiIndexSearchResults();
          const props = {
            defaultRefinement: {
              northEast: {
                lat: 10,
                lng: 12,
              },
              southWest: {
                lat: 12,
                lng: 14,
              },
            },
            contextValue,
            indexContextValue,
          };

          const actual = connector.getProvidedProps(
            props,
            searchState,
            searchResults
          );

          expect(actual.currentRefinement).toEqual({
            northEast: {
              lat: 10,
              lng: 12,
            },
            southWest: {
              lat: 12,
              lng: 14,
            },
          });
        });

        it('expect to return an undefined from an empty searchState', () => {
          const props = { contextValue, indexContextValue };
          const searchState = createMultiIndexSearchState();
          const searchResults = createMultiIndexSearchResults();

          const actual = connector.getProvidedProps(
            props,
            searchState,
            searchResults
          );

          expect(actual.currentRefinement).toBe(undefined);
        });
      });

      describe('isRefinedWithMap', () => {
        it("expect to return true when it's refined with the map (from the searchState)", () => {
          const hits = [
            { objectID: '123', _geoloc: true },
            { objectID: '456', _geoloc: true },
            { objectID: '789', _geoloc: true },
          ];

          const props = { contextValue, indexContextValue };
          const searchResults = createMultiIndexSearchResults(hits);
          const searchState = createMultiIndexSearchState({
            boundingBox: {
              northEast: {
                lat: 10,
                lng: 12,
              },
              southWest: {
                lat: 12,
                lng: 14,
              },
            },
          });

          const actual = connector.getProvidedProps(
            props,
            searchState,
            searchResults
          );

          expect(actual.isRefinedWithMap).toBe(true);
        });

        it("expect to return true when it's refined with the map (from the searchParameters)", () => {
          const hits = [
            { objectID: '123', _geoloc: true },
            { objectID: '456', _geoloc: true },
            { objectID: '789', _geoloc: true },
          ];

          const props = { contextValue, indexContextValue };
          const searchState = createMultiIndexSearchState();
          const searchResults = createMultiIndexSearchResults(hits, {
            insideBoundingBox: '10, 12, 12, 14',
          });

          const actual = connector.getProvidedProps(
            props,
            searchState,
            searchResults
          );

          expect(actual.isRefinedWithMap).toBe(true);
        });

        it("expect to return false when it's not refined with the map", () => {
          const hits = [
            { objectID: '123', _geoloc: true },
            { objectID: '456', _geoloc: true },
            { objectID: '789', _geoloc: true },
          ];

          const props = { contextValue, indexContextValue };
          const searchState = createMultiIndexSearchState();
          const searchResults = createMultiIndexSearchResults(hits);

          const actual = connector.getProvidedProps(
            props,
            searchState,
            searchResults
          );

          expect(actual.isRefinedWithMap).toBe(false);
        });
      });
    });

    describe('refine', () => {
      it('expect to set the boundingBox when boundingBox is provided', () => {
        const props = { contextValue, indexContextValue };
        const searchState = createMultiIndexSearchState();
        const nextRefinement = {
          northEast: {
            lat: 10,
            lng: 12,
          },
          southWest: {
            lat: 12,
            lng: 14,
          },
        };

        const actual = connector.refine(props, searchState, nextRefinement);

        const expectation = {
          indices: {
            second: {
              page: 1,
              boundingBox: {
                northEast: {
                  lat: 10,
                  lng: 12,
                },
                southWest: {
                  lat: 12,
                  lng: 14,
                },
              },
            },
          },
        };

        expect(actual).toEqual(expectation);
      });

      it('expect to replace the previous value when boundingBox is provided', () => {
        const props = { contextValue, indexContextValue };
        const searchState = createMultiIndexSearchState({
          boundingBox: {
            northEast: {
              lat: 8,
              lng: 10,
            },
            southWest: {
              lat: 10,
              lng: 12,
            },
          },
        });

        const nextRefinement = {
          northEast: {
            lat: 10,
            lng: 12,
          },
          southWest: {
            lat: 12,
            lng: 14,
          },
        };

        const actual = connector.refine(props, searchState, nextRefinement);

        const expectation = {
          indices: {
            second: {
              page: 1,
              boundingBox: {
                northEast: {
                  lat: 10,
                  lng: 12,
                },
                southWest: {
                  lat: 12,
                  lng: 14,
                },
              },
            },
          },
        };

        expect(actual).toEqual(expectation);
      });

      it('expect to clear the previous value when boundingBox is omit', () => {
        const props = { contextValue, indexContextValue };
        const searchState = createMultiIndexSearchState({
          boundingBox: {
            northEast: {
              lat: 8,
              lng: 10,
            },
            southWest: {
              lat: 10,
              lng: 12,
            },
          },
        });

        const actual = connector.refine(props, searchState);

        const expectation = {
          indices: {
            second: {
              page: 1,
            },
          },
        };

        expect(actual).toEqual(expectation);
      });
    });

    describe('getSearchParameters', () => {
      it('expect to set the parameter "insideBoundingBox" when boundingBox is provided', () => {
        const searchParameters = new SearchParameters();
        const props = { contextValue, indexContextValue };
        const searchState = createMultiIndexSearchState({
          boundingBox: {
            northEast: {
              lat: 10,
              lng: 12,
            },
            southWest: {
              lat: 12,
              lng: 14,
            },
          },
        });

        const actual = connector.getSearchParameters(
          searchParameters,
          props,
          searchState
        );

        const expectation = '10,12,12,14';

        expect(actual.insideBoundingBox).toEqual(expectation);
      });

      it('expect to return the given searchParameters when boundingBox is omit', () => {
        const searchParameters = new SearchParameters();
        const props = { contextValue, indexContextValue };
        const searchState = {};

        const actual = connector.getSearchParameters(
          searchParameters,
          props,
          searchState
        );

        expect(actual).toEqual(searchParameters);
      });
    });

    describe('cleanUp', () => {
      it('expect to remove the refinement from the searchState when boundingBox is provided', () => {
        const props = { contextValue, indexContextValue };
        const searchState = createMultiIndexSearchState({
          query: 'studio',
          boundingBox: {
            northEast: {
              lat: 10,
              lng: 12,
            },
            southWest: {
              lat: 12,
              lng: 14,
            },
          },
        });

        const actual = connector.cleanUp(props, searchState);

        const expectation = {
          indices: {
            second: {
              query: 'studio',
            },
          },
        };

        expect(actual).toEqual(expectation);
      });

      it('expect to return the given searchState when boundingBox is omit', () => {
        const props = { contextValue, indexContextValue };
        const searchState = createMultiIndexSearchState({
          query: 'studio',
        });

        const actual = connector.cleanUp(props, searchState);

        const expectation = {
          indices: {
            second: {
              query: 'studio',
            },
          },
        };

        expect(actual).toEqual(expectation);
      });
    });

    describe('getMetadata', () => {
      it('expect to return the meta when boundingBox is provided', () => {
        const props = { contextValue, indexContextValue };
        const searchState = createMultiIndexSearchState({
          boundingBox: {
            northEast: {
              lat: 10,
              lng: 12,
            },
            southWest: {
              lat: 12,
              lng: 14,
            },
          },
        });

        const actual = connector.getMetadata(props, searchState);

        const expectation = {
          id: 'boundingBox',
          index: 'second',
          items: [
            {
              label: 'boundingBox: 10,12,12,14',
              value: expect.any(Function),
              currentRefinement: {
                northEast: {
                  lat: 10,
                  lng: 12,
                },
                southWest: {
                  lat: 12,
                  lng: 14,
                },
              },
            },
          ],
        };

        expect(actual).toEqual(expectation);
      });

      it('expect to return an empty meta when boundingBox is omit', () => {
        const props = { contextValue, indexContextValue };
        const searchState = createMultiIndexSearchState();

        const actual = connector.getMetadata(props, searchState);

        const expectation = {
          id: 'boundingBox',
          index: 'second',
          items: [],
        };

        expect(actual).toEqual(expectation);
      });

      it('expect to clear the boundingBox when value is called', () => {
        const props = { contextValue, indexContextValue };
        const searchState = createMultiIndexSearchState({
          query: 'studio',
          boundingBox: {
            northEast: {
              lat: 10,
              lng: 12,
            },
            southWest: {
              lat: 12,
              lng: 14,
            },
          },
        });

        const metadata = connector.getMetadata(props, searchState);

        const actual = metadata.items[0].value(searchState);

        const expectation = {
          indices: {
            second: {
              query: 'studio',
              boundingBox: {},
              page: 1,
            },
          },
        };

        expect(actual).toEqual(expectation);
      });
    });
  });

  describe('shouldComponentUpdate', () => {
    it('expect to always return true', () => {
      const expectation = true;
      const actual = connector.shouldComponentUpdate();

      expect(actual).toBe(expectation);
    });
  });
});
