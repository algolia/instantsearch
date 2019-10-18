import connect from '../connectStats';

jest.mock('../../core/createConnector', () => x => x);

let props;
describe('connectStats', () => {
  describe('single index', () => {
    const contextValue = { mainTargetedIndex: 'index' };

    it('provides the correct props to the component', () => {
      props = connect.getProvidedProps({ contextValue }, null, {});
      expect(props).toBe(null);

      props = connect.getProvidedProps({ contextValue }, null, {
        results: { nbHits: 666, processingTimeMS: 1, hits: [] },
      });
      expect(props).toEqual({ nbHits: 666, processingTimeMS: 1 });
    });
  });

  describe('multi index', () => {
    const contextValue = { mainTargetedIndex: 'first' };
    const indexContextValue = { targetedIndex: 'second' };

    it('provides the correct props to the component', () => {
      props = connect.getProvidedProps(
        { contextValue, indexContextValue },
        null,
        {}
      );
      expect(props).toBe(null);

      props = connect.getProvidedProps(
        { contextValue, indexContextValue },
        null,
        {
          results: { second: { nbHits: 666, processingTimeMS: 1 } },
        }
      );
      expect(props).toEqual({ nbHits: 666, processingTimeMS: 1 });
    });
  });
});
