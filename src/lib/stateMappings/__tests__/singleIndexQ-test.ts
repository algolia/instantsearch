import singleIndexQStateMapping from '../singleIndexQ';

describe('singleIndexQStateMapping', () => {
  describe('stateToRoute', () => {
    it('passes normal state through', () => {
      const stateMapping = singleIndexQStateMapping('indexName');
      const actual = stateMapping.stateToRoute({
        indexName: {
          query: 'zamboni',
          refinementList: {
            color: ['red'],
          },
        },
      });

      expect(actual).toEqual({
        q: 'zamboni',
        refinementList: {
          color: ['red'],
        },
      });
    });

    it('removes configure', () => {
      const stateMapping = singleIndexQStateMapping('indexName');
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
        q: 'zamboni',
        refinementList: {
          color: ['red'],
        },
      });
    });

    it('passes non-UiState through', () => {
      const stateMapping = singleIndexQStateMapping('indexName');
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
        q: 'zamboni',
        refinementList: {
          color: ['red'],
        },
        spy: ['stealing', 'all', 'your', 'searches'],
      });
    });

    it('picks the correct index', () => {
      const stateMapping = singleIndexQStateMapping('indexName');
      const actual = stateMapping.stateToRoute({
        indexName: {
          query: 'zamboni',
          refinementList: {
            color: ['red'],
          },
        },
        anotherIndex: {
          // @ts-ignore
          totally: 'ignored',
          refinementList: {
            color: ['blue'],
          },
        },
      });

      expect(actual).toEqual({
        q: 'zamboni',
        refinementList: {
          color: ['red'],
        },
      });
    });

    it('empty object if there is no matching index', () => {
      const stateMapping = singleIndexQStateMapping('magicIndex');
      const actual = stateMapping.stateToRoute({
        indexName: {
          query: 'zamboni',
          refinementList: {
            color: ['red'],
          },
        },
        anotherIndex: {
          // @ts-ignore
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
      const stateMapping = singleIndexQStateMapping('indexName');
      const actual = stateMapping.routeToState({
        q: 'zamboni',
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
      const stateMapping = singleIndexQStateMapping('indexName');
      const actual = stateMapping.routeToState({
        q: 'zamboni',
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
      const stateMapping = singleIndexQStateMapping('indexName');
      const actual = stateMapping.routeToState({
        q: 'zamboni',
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

    it('returns wrong data if used with nested state', () => {
      const stateMapping = singleIndexQStateMapping('indexName');
      const actual = stateMapping.routeToState({
        // @ts-ignore (we are passing wrong data)
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
      const stateMapping = singleIndexQStateMapping('indexName');
      const actual = stateMapping.routeToState({});

      expect(actual).toEqual({
        indexName: {},
      });
    });
  });
});
