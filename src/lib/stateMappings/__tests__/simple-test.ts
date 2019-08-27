import simpleStateMapping from '../simple';
import { UiState } from '../../../types';

describe('simpleStateMapping', () => {
  describe('stateToRoute', () => {
    it('passes normal state through', () => {
      const stateMapping = simpleStateMapping();
      expect(
        stateMapping.stateToRoute({
          query: 'zamboni',
          refinementList: {
            color: ['red'],
          },
        })
      ).toEqual({
        query: 'zamboni',
        refinementList: {
          color: ['red'],
        },
      });
    });

    it('removes configure', () => {
      const stateMapping = simpleStateMapping();
      expect(
        stateMapping.stateToRoute({
          query: 'zamboni',
          refinementList: {
            color: ['red'],
          },
          configure: {
            advancedSyntax: false,
          },
        })
      ).toEqual({
        query: 'zamboni',
        refinementList: {
          color: ['red'],
        },
      });
    });

    it('passes non-UiState through', () => {
      const stateMapping = simpleStateMapping();
      expect(
        stateMapping.stateToRoute({
          query: 'zamboni',
          refinementList: {
            color: ['red'],
          },
          spy: ['stealing', 'all', 'your', 'searches'],
        } as UiState)
      ).toEqual({
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
      const stateMapping = simpleStateMapping();
      expect(
        stateMapping.routeToState({
          query: 'zamboni',
          refinementList: {
            color: ['red'],
          },
        })
      ).toEqual({
        query: 'zamboni',
        refinementList: {
          color: ['red'],
        },
      });
    });

    it('removes configure', () => {
      const stateMapping = simpleStateMapping();
      expect(
        stateMapping.routeToState({
          query: 'zamboni',
          refinementList: {
            color: ['red'],
          },
          configure: {
            advancedSyntax: false,
          },
        })
      ).toEqual({
        query: 'zamboni',
        refinementList: {
          color: ['red'],
        },
      });
    });

    it('passes non-UiState through', () => {
      const stateMapping = simpleStateMapping();
      expect(
        stateMapping.routeToState({
          query: 'zamboni',
          refinementList: {
            color: ['red'],
          },
          spy: ['stealing', 'all', 'your', 'searches'],
        } as UiState)
      ).toEqual({
        query: 'zamboni',
        refinementList: {
          color: ['red'],
        },
        spy: ['stealing', 'all', 'your', 'searches'],
      });
    });
  });
});
