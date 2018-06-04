import connect from '../connectStats';

jest.mock('../../core/createConnector', () => x => x);

let props;
describe('connectStats', () => {
  describe('single index', () => {
    const context = { context: { ais: { mainTargetedIndex: 'index' } } };
    const getProvidedProps = connect.getProvidedProps.bind(context);
    it('provides the correct props to the component', () => {
      props = getProvidedProps(null, null, {});
      expect(props).toBe(null);

      props = getProvidedProps(null, null, {
        results: { nbHits: 666, processingTimeMS: 1, hits: [] },
      });
      expect(props).toEqual({ nbHits: 666, processingTimeMS: 1 });
    });
  });
  describe('multi index', () => {
    const context = {
      context: {
        ais: { mainTargetedIndex: 'first' },
        multiIndexContext: { targetedIndex: 'second' },
      },
    };
    const getProvidedProps = connect.getProvidedProps.bind(context);
    it('provides the correct props to the component', () => {
      props = getProvidedProps(null, null, {});
      expect(props).toBe(null);

      props = getProvidedProps(null, null, {
        results: { second: { nbHits: 666, processingTimeMS: 1 } },
      });
      expect(props).toEqual({ nbHits: 666, processingTimeMS: 1 });
    });
  });
});
