/* eslint-env jest, jasmine */

jest.mock('algoliasearch-helper-provider/src/connect', () =>
  mapStateToProps => state => mapStateToProps(state)
);

import createHits from './createHits';
jest.unmock('./createHits');

describe('createHits', () => {
  it('provides the current hits to the component', () => {
    const hits = {};
    const props = createHits({searchResults: {hits}});
    expect(Object.keys(props).length).toBe(1);
    expect(props.hits).toBe(hits);
  });
});
