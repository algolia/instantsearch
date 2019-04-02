import connect from '../connectHits';

jest.mock('../../core/createConnector', () => x => x);

const { getSearchParameters } = connect;

describe('connectHits', () => {
  describe('single index', () => {
    const context = { context: { ais: { mainTargetedIndex: 'index' } } };
    const getProvidedProps = connect.getProvidedProps.bind(context);
    it('provides the current hits to the component', () => {
      const hits = [{}];
      const props = getProvidedProps(null, null, {
        results: { hits, hitsPerPage: 2, page: 2 },
      });
      expect(props).toEqual({
        hits: hits.map(hit => expect.objectContaining(hit)),
      });
    });

    it('adds positions to the hits provided to the component', () => {
      const hits = [{}];
      const props = getProvidedProps(null, null, {
        results: { hits, hitsPerPage: 2, page: 2 },
      });
      expect(props).toEqual({
        hits: [{ __position: 5 }],
      });
    });

    it('adds queryID to the hits provided to the component', () => {
      const hits = [{}];
      const props = getProvidedProps(null, null, {
        results: { hits, hitsPerPage: 2, page: 2, queryID: 'theQueryID' },
      });
      expect(props).toEqual({
        hits: [expect.objectContaining({ __queryID: 'theQueryID' })],
      });
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
        results: { second: { hits, hitsPerPage: 2, page: 2 } },
      });
      expect(props).toEqual({
        hits: hits.map(hit => expect.objectContaining(hit)),
      });
    });

    it('adds positions to the hits provided to the component', () => {
      const hits = [{}];
      const props = getProvidedProps(null, null, {
        results: { second: { hits, hitsPerPage: 2, page: 2 } },
      });
      expect(props).toEqual({
        hits: [{ __position: 5 }],
      });
    });

    it('adds queryID to the hits provided to the component', () => {
      const hits = [{}];
      const props = getProvidedProps(null, null, {
        results: {
          second: { hits, hitsPerPage: 2, page: 2, queryID: 'theQueryID' },
        },
      });
      expect(props).toEqual({
        hits: [expect.objectContaining({ __queryID: 'theQueryID' })],
      });
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
