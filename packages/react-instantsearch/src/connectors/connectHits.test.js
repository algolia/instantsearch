/* eslint-env jest, jasmine */

import connect from './connectHits.js';
jest.mock('../core/createConnector');

const {getProvidedProps, getSearchParameters} = connect;

describe('connectHits', () => {
  it('provides the current hits to the component', () => {
    const hits = [{}];
    const props = getProvidedProps(null, null, {results: {hits}});
    expect(props).toEqual({hits});
  });

  it('doesn\'t render when no hits are available', () => {
    const props = getProvidedProps(null, null, {results: null});
    expect(props).toEqual({hits: []});
  });

  it('should return the searchParameters unchanged', () => {
    const searchParameters = getSearchParameters({hitsPerPage: 10});
    expect(searchParameters).toEqual({hitsPerPage: 10});
  });
});
