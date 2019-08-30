import compatibilityStateMapping from '../compat';

describe('compatibilityStateMapping', () => {
  describe('stateToRoute', () => {
    it('passes normal state through', () => {
      const stateMapping = compatibilityStateMapping('indexName');
      const actual = stateMapping.stateToRoute({
        indexName: {
          query: 'zamboni',
          refinementList: {
            color: ['red'],
          },
        },
      });

      expect(actual).toEqual({
        query: 'zamboni',
        refinementList: {
          color: ['red'],
        },
      });
    });

    it('removes configure', () => {
      const stateMapping = compatibilityStateMapping('indexName');
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
        query: 'zamboni',
        refinementList: {
          color: ['red'],
        },
      });
    });

    it('passes non-UiState through', () => {
      const stateMapping = compatibilityStateMapping('indexName');
      const actual = stateMapping.stateToRoute({
        indexName: {
          query: 'zamboni',
          refinementList: {
            color: ['red'],
          },
          // @ts-ignore
          spy: ['stealing', 'all', 'your', 'searches'],
        },
      });

      expect(actual).toEqual({
        query: 'zamboni',
        refinementList: {
          color: ['red'],
        },
        spy: ['stealing', 'all', 'your', 'searches'],
      });
    });
  });

  describe('routeToState', () => {
    it('passes normal state through', () => {
      const stateMapping = compatibilityStateMapping('indexName');
      const actual = stateMapping.routeToState({
        query: 'zamboni',
        refinementList: {
          color: ['red'],
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
      const stateMapping = compatibilityStateMapping('indexName');
      const actual = stateMapping.routeToState({
        query: 'zamboni',
        refinementList: {
          color: ['red'],
        },
        configure: {
          advancedSyntax: false,
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
      const stateMapping = compatibilityStateMapping('indexName');
      const actual = stateMapping.routeToState({
        query: 'zamboni',
        refinementList: {
          color: ['red'],
        },
        // @ts-ignore
        spy: ['stealing', 'all', 'your', 'searches'],
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
