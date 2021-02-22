import { ConnectorDescription } from '../../core/createConnector';
import connectReal from '../connectSmartSort';

jest.mock(
  '../../core/createConnector',
  () => (connector: ConnectorDescription) => connector
);
// our mock implementation is diverging from the regular createConnector,
// so we redefine it as `any` here, since we have no more information
// @TODO: refactor these tests to work better with TS
const connect: any = connectReal;

describe('connectSmartSort', () => {
  describe('single index', () => {
    const contextValue = { mainTargetedIndex: 'index' };

    it('returns false when results are null', () => {
      const props = connect.getProvidedProps({ contextValue }, null, {
        results: null,
      });

      expect(props).toEqual({
        isSmartSorted: false,
        isVirtualReplica: false,
      });
    });

    it('returns correct props with defined appliedRelevancyStrictness', () => {
      const props = connect.getProvidedProps({ contextValue }, null, {
        results: {
          hits: [],
          nbHits: 300,
          nbSortedHits: 1,
          appliedRelevancyStrictness: 30,
        },
      });

      expect(props).toEqual({
        isSmartSorted: true,
        isVirtualReplica: true,
      });
    });

    it('returns correct props with undefined appliedRelevancyStrictness', () => {
      const props = connect.getProvidedProps({ contextValue }, null, {
        results: {},
      });

      expect(props).toEqual({
        isSmartSorted: false,
        isVirtualReplica: false,
      });
    });

    it('decide isSmartSorted based on appliedRelevancyStrictness', () => {
      const props = connect.getProvidedProps({ contextValue }, null, {
        results: {
          hits: [],
          appliedRelevancyStrictness: 0,
        },
      });

      expect(props).toEqual({
        isSmartSorted: false,
        isVirtualReplica: true,
      });
    });

    it('apply relevancyStrictness on refine', () => {
      let props = connect.getProvidedProps({ contextValue }, null, {
        results: {
          hits: [],
          nbHits: 300,
          nbSortedHits: 1,
          appliedRelevancyStrictness: 98,
        },
      });

      expect(props).toEqual({
        isSmartSorted: true,
        isVirtualReplica: true,
      });

      const searchState = connect.refine({}, { relevancyStrictness: 98 }, 0);

      expect(searchState).toEqual({
        relevancyStrictness: 0,
        page: 1,
      });

      props = connect.getProvidedProps({ contextValue }, searchState, {
        results: {
          hits: [],
          appliedRelevancyStrictness: 0,
        },
      });

      expect(props).toEqual({
        isSmartSorted: false,
        isVirtualReplica: true,
      });
    });
  });

  describe('multi index', () => {
    const contextValue = { mainTargetedIndex: 'first' };
    const indexContextValue = { targetedIndex: 'second' };

    it('returns false when results are null', () => {
      const props = connect.getProvidedProps(
        { contextValue, indexContextValue },
        null,
        {
          results: { second: null },
        }
      );

      expect(props).toEqual({
        isSmartSorted: false,
        isVirtualReplica: false,
      });
    });

    it('returns correct props with defined appliedRelevancyStrictness', () => {
      const props = connect.getProvidedProps(
        { contextValue, indexContextValue },
        null,
        {
          results: {
            second: {
              hits: [],
              nbHits: 300,
              nbSortedHits: 1,
              appliedRelevancyStrictness: 30,
            },
          },
        }
      );

      expect(props).toEqual({
        isSmartSorted: true,
        isVirtualReplica: true,
      });
    });

    it('returns correct props with undefined appliedRelevancyStrictness', () => {
      const props = connect.getProvidedProps(
        { contextValue, indexContextValue },
        null,
        {
          results: { second: {} },
        }
      );

      expect(props).toEqual({
        isSmartSorted: false,
        isVirtualReplica: false,
      });
    });

    it('decide isSmartSorted based on appliedRelevancyStrictness', () => {
      const props = connect.getProvidedProps(
        { contextValue, indexContextValue },
        null,
        {
          results: {
            second: {
              hits: [],
              appliedRelevancyStrictness: 0,
            },
          },
        }
      );

      expect(props).toEqual({
        isSmartSorted: false,
        isVirtualReplica: true,
      });
    });

    it('apply relevancyStrictness on refine', () => {
      let props = connect.getProvidedProps(
        { contextValue, indexContextValue },
        null,
        {
          results: {
            second: {
              hits: [],
              nbHits: 300,
              nbSortedHits: 1,
              appliedRelevancyStrictness: 30,
            },
          },
        }
      );

      expect(props).toEqual({
        isSmartSorted: true,
        isVirtualReplica: true,
      });

      const searchState = connect.refine({}, { relevancyStrictness: 98 }, 0);

      expect(searchState).toEqual({
        relevancyStrictness: 0,
        page: 1,
      });

      props = connect.getProvidedProps(
        { contextValue, indexContextValue },
        searchState,
        {
          results: {
            second: {
              hits: [],
              appliedRelevancyStrictness: 0,
            },
          },
        }
      );

      expect(props).toEqual({
        isSmartSorted: false,
        isVirtualReplica: true,
      });
    });
  });
});
