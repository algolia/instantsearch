import type { UiState } from '../../../types';
import simpleStateMapping from '../simple';

describe('simpleStateMapping', () => {
  describe('stateToRoute', () => {
    it('passes normal state through', () => {
      const stateMapping = simpleStateMapping();
      const actual = stateMapping.stateToRoute({
        indexName: {
          query: 'zamboni',
          refinementList: {
            color: ['red'],
          },
        },
      });

      expect(actual).toEqual({
        indexName: {
          query: 'zamboni',
          refinementList: {
            color: ['red'],
          },
        },
      });
    });

    it('removes configure', () => {
      const stateMapping = simpleStateMapping();
      const actual = stateMapping.stateToRoute({
        indexName: {
          query: 'zamboni',
          refinementList: {
            color: ['red'],
          },
          configure: {
            advancedSyntax: false,
          },
        },
      });

      expect(actual).toEqual({
        indexName: {
          query: 'zamboni',
          refinementList: {
            color: ['red'],
          },
        },
      });
    });

    it('passes non-UiState through', () => {
      const stateMapping = simpleStateMapping();
      const actual = stateMapping.stateToRoute({
        indexName: {
          query: 'zamboni',
          refinementList: {
            color: ['red'],
          },
          // @ts-expect-error
          spy: ['stealing', 'all', 'your', 'searches'],
        },
      });

      expect(actual).toEqual({
        indexName: {
          query: 'zamboni',
          refinementList: {
            color: ['red'],
          },
          spy: ['stealing', 'all', 'your', 'searches'],
        },
      });
    });
  });

  describe('routeToState', () => {
    it('passes normal state through', () => {
      const stateMapping = simpleStateMapping();
      const actual = stateMapping.routeToState({
        indexName: {
          query: 'zamboni',
          refinementList: {
            color: ['red'],
          },
        },
      });

      expect(actual).toEqual({
        indexName: {
          query: 'zamboni',
          refinementList: {
            color: ['red'],
          },
        },
      });
    });

    it('removes configure', () => {
      const stateMapping = simpleStateMapping();
      const actual = stateMapping.routeToState({
        indexName: {
          query: 'zamboni',
          refinementList: {
            color: ['red'],
          },
          configure: {
            advancedSyntax: false,
          },
        },
      });

      expect(actual).toEqual({
        indexName: {
          query: 'zamboni',
          refinementList: {
            color: ['red'],
          },
        },
      });
    });

    it('passes non-UiState through', () => {
      const stateMapping = simpleStateMapping<
        UiState & { [indexId: string]: { spy: string[] } }
      >();
      const actual = stateMapping.routeToState({
        indexName: {
          query: 'zamboni',
          refinementList: {
            color: ['red'],
          },
          spy: ['stealing', 'all', 'your', 'searches'],
        },
      });

      expect(actual).toEqual({
        indexName: {
          query: 'zamboni',
          refinementList: {
            color: ['red'],
          },
          spy: ['stealing', 'all', 'your', 'searches'],
        },
      });
    });

    it('doesn\'t throw if an index state is null', () => {
      const stateMapping = simpleStateMapping<
        UiState & { [indexId: string]: { spy: string[] } }
      >();
      const actual = stateMapping.routeToState({
        // @ts-expect-error
        indexName: null,
      });

      expect(actual).toEqual({
        indexName: {}
      })
    });

  });
});
