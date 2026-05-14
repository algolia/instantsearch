import simpleStateMapping from '../simple';

import type { UiState } from '../../../types';

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

    it('ignores non-object top-level params (e.g. UTM params)', () => {
      const stateMapping = simpleStateMapping();
      const actual = stateMapping.routeToState({
        // @ts-expect-error simulating qs.parse() output with flat string params
        utm_medium: 'test',
        indexName: {
          query: 'zamboni',
        },
      });

      expect(actual).toEqual({
        indexName: {
          query: 'zamboni',
        },
      });
    });

    it('passes non-UiState through', () => {
      const stateMapping = simpleStateMapping<{
        [indexId in string]: UiState[indexId] & { spy: string[] };
      }>();
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
  });
});
