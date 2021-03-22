import singleIndexStateMapping from '../singleIndex';

describe('singleIndexStateMapping', () => {
  describe('stateToRoute', () => {
    it('passes normal state through', () => {
      const stateMapping = singleIndexStateMapping('indexName');
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
      const stateMapping = singleIndexStateMapping('indexName');
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
      const stateMapping = singleIndexStateMapping('indexName');
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
        query: 'zamboni',
        refinementList: {
          color: ['red'],
        },
        spy: ['stealing', 'all', 'your', 'searches'],
      });
    });

    it('picks the correct index', () => {
      const stateMapping = singleIndexStateMapping('indexName');
      const actual = stateMapping.stateToRoute({
        indexName: {
          query: 'zamboni',
          refinementList: {
            color: ['red'],
          },
        },
        anotherIndex: {
          // @ts-expect-error
          totally: 'ignored',
          refinementList: {
            color: ['blue'],
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

    it('empty object if there is no matching index', () => {
      const stateMapping = singleIndexStateMapping('magicIndex');
      const actual = stateMapping.stateToRoute({
        indexName: {
          query: 'zamboni',
          refinementList: {
            color: ['red'],
          },
        },
        anotherIndex: {
          // @ts-expect-error
          totally: 'ignored',
          refinementList: {
            color: ['blue'],
          },
        },
      });

      expect(actual).toEqual({});
    });
  });

  describe('routeToState', () => {
    it('passes normal state through', () => {
      const stateMapping = singleIndexStateMapping('indexName');
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
      const stateMapping = singleIndexStateMapping('indexName');
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
      const stateMapping = singleIndexStateMapping('indexName');
      const actual = stateMapping.routeToState({
        query: 'zamboni',
        refinementList: {
          color: ['red'],
        },
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

    it('returns wrong data if used with nested state', () => {
      const stateMapping = singleIndexStateMapping('indexName');
      const actual = stateMapping.routeToState({
        indexName: {
          query: 'zamboni',
          refinementList: {
            color: ['red'],
          },
        },
        anotherIndex: {},
      });

      expect(actual).toEqual({
        indexName: {
          indexName: {
            query: 'zamboni',
            refinementList: {
              color: ['red'],
            },
          },
          anotherIndex: {},
        },
      });
    });

    it('keeps empty index empty', () => {
      const stateMapping = singleIndexStateMapping('indexName');
      const actual = stateMapping.routeToState({});

      expect(actual).toEqual({
        indexName: {},
      });
    });
  });
});
