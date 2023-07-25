import { SearchParameters } from 'algoliasearch-helper';

import connect from '../connectVoiceSearch';

jest.mock('../../core/createConnector', () => (x) => x);

describe('connectVoiceSearch', () => {
  describe('single index', () => {
    const contextValue = { mainTargetedIndex: 'index' };

    describe('getProvidedProps', () => {
      it('provides the correct props to the component', () => {
        expect(connect.getProvidedProps({ contextValue }, {}, {})).toEqual({
          currentRefinement: '',
        });

        expect(
          connect.getProvidedProps({ contextValue }, { query: 'abc' }, {})
        ).toEqual({
          currentRefinement: 'abc',
        });
      });
    });

    describe('refine', () => {
      it('calls refine and updates the state correctly', () => {
        expect(connect.refine({ contextValue }, {}, 'abc')).toEqual({
          page: 1,
          query: 'abc',
          additionalVoiceParameters: {},
        });
      });

      it('refines and get additionalVoiceParameters', () => {
        const { additionalVoiceParameters } = connect.refine(
          { contextValue },
          {},
          'abc'
        );
        expect(additionalVoiceParameters).toEqual(expect.objectContaining({}));
      });

      it('refines with additionalQueryParameters', () => {
        const props = {
          contextValue,
          additionalQueryParameters: () => ({ additional: 'param' }),
        };
        expect(connect.refine(props, {}, 'abc')).toEqual({
          page: 1,
          query: 'abc',
          additionalVoiceParameters: {
            additional: 'param',
            ignorePlurals: true,
            optionalWords: 'abc',
            queryLanguages: undefined,
            removeStopWords: true,
          },
        });
      });

      it('refines with language', () => {
        const props = { contextValue, language: 'en-US' };
        expect(connect.refine(props, {}, 'abc')).toEqual({
          page: 1,
          query: 'abc',
          additionalVoiceParameters: {
            queryLanguages: ['en'],
          },
        });
      });

      it('refines with language (2)', () => {
        const props = {
          contextValue,
          language: 'en-US',
          additionalQueryParameters: () => ({}),
        };
        expect(connect.refine(props, {}, 'abc')).toEqual({
          page: 1,
          query: 'abc',
          additionalVoiceParameters: {
            ignorePlurals: true,
            optionalWords: 'abc',
            queryLanguages: ['en'],
            removeStopWords: true,
          },
        });
      });

      it('overrides with additionalQueryParameters', () => {
        const props = {
          contextValue,
          additionalQueryParameters: () => ({
            ignorePlurals: false,
            optionalWords: 'something else',
            removeStopWords: false,
          }),
        };
        expect(connect.refine(props, {}, 'abc')).toEqual({
          page: 1,
          query: 'abc',
          additionalVoiceParameters: {
            ignorePlurals: false,
            optionalWords: 'something else',
            removeStopWords: false,
          },
        });
      });
    });

    describe('cleanUp', () => {
      it('should return the right searchState when clean up', () => {
        expect(
          connect.cleanUp(
            {
              contextValue,
            },
            {
              query: 'abc',
              additionalVoiceParameters: {
                ignorePlurals: true,
                optionalWords: 'abc',
                queryLanguages: ['en'],
                removeStopWords: true,
              },
            }
          )
        ).toEqual({});
      });
    });

    describe('getSearchParameters', () => {
      it('returns searchParameters with query', () => {
        expect(
          connect.getSearchParameters(
            new SearchParameters(),
            {
              contextValue,
            },
            { query: 'foo' }
          )
        ).toEqual(expect.objectContaining({ query: 'foo' }));
      });

      it('returns searchParameters with additional params', () => {
        expect(
          connect.getSearchParameters(
            new SearchParameters(),
            {
              contextValue,
            },
            {
              query: 'abc',
              additionalVoiceParameters: {
                ignorePlurals: true,
                optionalWords: 'abc',
                queryLanguages: ['en'],
                removeStopWords: true,
              },
            }
          )
        ).toEqual(
          expect.objectContaining({
            ignorePlurals: true,
            optionalWords: 'abc',
            queryLanguages: ['en'],
            removeStopWords: true,
            query: 'abc',
          })
        );
      });
    });

    describe('getMetadata', () => {
      it('returns correct metadata', () => {
        expect(
          connect.getMetadata(
            {
              contextValue,
            },
            {
              ignorePlurals: true,
              optionalWords: 'abc',
              queryLanguages: ['en'],
              removeStopWords: true,
              query: 'abc',
            }
          )
        ).toEqual({
          id: 'query',
          index: 'index',
          items: [
            {
              label: 'query: abc',
              value: expect.any(Function),
              currentRefinement: 'abc',
            },
          ],
        });
      });
    });
  });

  describe('multi index', () => {
    const contextValue = { mainTargetedIndex: 'first' };
    const indexContextValue = { targetedIndex: 'second' };

    describe('getProvidedProps', () => {
      it('provides the correct props to the component', () => {
        expect(
          connect.getProvidedProps({ contextValue, indexContextValue }, {}, {})
        ).toEqual({
          currentRefinement: '',
        });

        expect(
          connect.getProvidedProps(
            { contextValue, indexContextValue },
            { indices: { second: { query: 'yep' } } },
            {}
          )
        ).toEqual({
          currentRefinement: 'yep',
        });
      });
    });

    describe('refine', () => {
      it('refines with additionalQueryParameters', () => {
        const props = {
          contextValue,
          indexContextValue,
          additionalQueryParameters: () => ({ additional: 'param' }),
        };
        expect(connect.refine(props, {}, 'abc')).toEqual({
          indices: {
            second: {
              page: 1,
              query: 'abc',
              additionalVoiceParameters: {
                additional: 'param',
                ignorePlurals: true,
                optionalWords: 'abc',
                queryLanguages: undefined,
                removeStopWords: true,
              },
            },
          },
        });
      });

      it('refines with language', () => {
        const props = { contextValue, indexContextValue, language: 'en-US' };
        expect(connect.refine(props, {}, 'abc')).toEqual({
          indices: {
            second: {
              page: 1,
              query: 'abc',
              additionalVoiceParameters: {
                queryLanguages: ['en'],
              },
            },
          },
        });
      });
    });

    describe('getSearchParameters', () => {
      it('returns searchParameters with query', () => {
        expect(
          connect.getSearchParameters(
            new SearchParameters(),
            {
              contextValue,
              indexContextValue,
            },
            { indices: { second: { query: 'foo' } } }
          )
        ).toEqual(expect.objectContaining({ query: 'foo' }));
      });

      it('returns searchParameters with additional params', () => {
        expect(
          connect.getSearchParameters(
            new SearchParameters(),
            {
              contextValue,
              indexContextValue,
            },
            {
              indices: {
                second: {
                  query: 'abc',
                  additionalVoiceParameters: {
                    ignorePlurals: true,
                    optionalWords: 'abc',
                    queryLanguages: ['en'],
                    removeStopWords: true,
                  },
                },
              },
            }
          )
        ).toEqual(
          expect.objectContaining({
            ignorePlurals: true,
            optionalWords: 'abc',
            queryLanguages: ['en'],
            removeStopWords: true,
            query: 'abc',
          })
        );
      });
    });

    describe('getMetadata', () => {
      it('returns correct metadata', () => {
        expect(
          connect.getMetadata(
            {
              contextValue,
              indexContextValue,
            },
            {
              indices: {
                second: {
                  ignorePlurals: true,
                  optionalWords: 'abc',
                  queryLanguages: ['en'],
                  removeStopWords: true,
                  query: 'abc',
                },
              },
            }
          )
        ).toEqual({
          id: 'query',
          index: 'second',
          items: [
            {
              label: 'query: abc',
              value: expect.any(Function),
              currentRefinement: 'abc',
            },
          ],
        });
      });
    });
  });
});
