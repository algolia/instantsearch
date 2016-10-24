/* eslint-env jest, jasmine */

import {SearchParameters} from 'algoliasearch-helper';
import connect from './connectHits.js';
jest.mock('../core/createConnector');

const {getSearchParameters, getProps} = connect;

describe('connectHits', () => {
  it('provides the current hits to the component', () => {
    const hits = {};
    const props = getProps(null, null, {results: {hits}});
    expect(props.hits).toBe(hits);
  });

  it('doesn\'t render when no hits are available', () => {
    const props = getProps(null, null, {results: null});
    expect(props).toBe(null);
  });

  it('defaults hitsPerPage to its hitsPerPage prop', () => {
    const params = new SearchParameters();
    const params2 = getSearchParameters(params, {hitsPerPage: 666});
    expect(params2.hitsPerPage).toBe(666);
    const params3 = getSearchParameters(params2, {hitsPerPage: 777});
    expect(params3.hitsPerPage).toBe(666);
  });
});
