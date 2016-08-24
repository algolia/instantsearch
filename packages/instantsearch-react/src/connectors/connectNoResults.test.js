/* eslint-env jest, jasmine */

import connectNoResults from './connectNoResults';
jest.unmock('./connectNoResults');

const {getProps} = connectNoResults;

let props;
describe('connectNoResults', () => {
  it('provides the correct props to the component', () => {
    props = getProps(null, null, {});
    expect(props).toBe(null);

    props = getProps(null, null, {results: {nbHits: 0}});
    expect(props).toEqual({noResults: true});

    props = getProps(null, null, {results: {nbHits: 1}});
    expect(props).toEqual({noResults: false});
  });
});
