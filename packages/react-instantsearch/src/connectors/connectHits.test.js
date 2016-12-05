/* eslint-env jest, jasmine */

import connect from './connectHits.js';
jest.mock('../core/createConnector');

const {getProvidedProps} = connect;

describe('connectHits', () => {
  it('provides the current hits to the component', () => {
    const hits = {};
    const props = getProvidedProps(null, null, {results: {hits}});
    expect(props.hits).toBe(hits);
  });

  it('doesn\'t render when no hits are available', () => {
    const props = getProvidedProps(null, null, {results: null});
    expect(props).toBe(null);
  });
});
