import connect from './connectHits.js';

jest.mock('../core/createConnector');

const { getSearchParameters } = connect;

describe('connectHits', () => {
  describe('single index', () => {
    const context = { context: { ais: { mainTargetedIndex: 'index' } } };
    const getProvidedProps = connect.getProvidedProps.bind(context);
    it('provides the current hits to the component', () => {
      const hits = [{}];
      const props = getProvidedProps(null, null, {
        results: { hits },
      });
      expect(props).toEqual({ hits });
    });

    it("doesn't render when no hits are available", () => {
      const props = getProvidedProps(null, null, { results: null });
      expect(props).toEqual({ hits: [] });
    });

    it('should return the searchParameters unchanged', () => {
      const searchParameters = getSearchParameters({ hitsPerPage: 10 });
      expect(searchParameters).toEqual({ hitsPerPage: 10 });
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
    it('provides the current hits to the component', () => {
      const hits = [{}];
      const props = getProvidedProps(null, null, {
        results: { second: { hits } },
      });
      expect(props).toEqual({ hits });
    });

    it("doesn't render when no hits are available", () => {
      const props = getProvidedProps(null, null, { results: { second: null } });
      expect(props).toEqual({ hits: [] });
    });

    it('should return the searchParameters unchanged', () => {
      const searchParameters = getSearchParameters({ hitsPerPage: 10 });
      expect(searchParameters).toEqual({ hitsPerPage: 10 });
    });
  });
});
