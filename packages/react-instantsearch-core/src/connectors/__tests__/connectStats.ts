import connectReal from '../connectStats';

import type { ConnectorDescription } from '../../core/createConnector';

jest.mock(
  '../../core/createConnector',
  () => (connector: ConnectorDescription) => connector
);
// our mock implementation is diverging from the regular createConnector,
// so we redefine it as `any` here, since we have no more information
// @TODO: refactor these tests to work better with TS
const connect: any = connectReal;

describe('connectStats', () => {
  describe('single index', () => {
    const contextValue = { mainTargetedIndex: 'index' };

    it('provides the correct props to the component', () => {
      let props = connect.getProvidedProps({ contextValue }, null, {});
      expect(props).toBe(null);

      props = connect.getProvidedProps({ contextValue }, null, {
        results: {
          nbHits: 666,
          processingTimeMS: 1,
          hits: [],
          nbSortedHits: undefined,
          isRelevantSorted: false,
        },
      });
      expect(props).toEqual({
        nbHits: 666,
        processingTimeMS: 1,
        nbSortedHits: undefined,
        areHitsSorted: false,
      });
    });
  });

  describe('multi index', () => {
    const contextValue = { mainTargetedIndex: 'first' };
    const indexContextValue = { targetedIndex: 'second' };

    it('provides the correct props to the component', () => {
      let props = connect.getProvidedProps(
        { contextValue, indexContextValue },
        null,
        {}
      );
      expect(props).toBe(null);

      props = connect.getProvidedProps(
        { contextValue, indexContextValue },
        null,
        {
          results: {
            second: {
              nbHits: 666,
              processingTimeMS: 1,
              nbSortedHits: undefined,
              isRelevantSorted: false,
            },
          },
        }
      );
      expect(props).toEqual({
        nbHits: 666,
        processingTimeMS: 1,
        nbSortedHits: undefined,
        areHitsSorted: false,
      });
    });
  });
});
