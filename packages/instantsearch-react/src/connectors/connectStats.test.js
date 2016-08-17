/* eslint-env jest, jasmine */

import connectStats from './connectStats';
jest.unmock('./connectStats');

const {getProps} = connectStats;

let props;
describe('connectStats', () => {
  it('provides the correct props to the component', () => {
    props = getProps(null, null, {});
    expect(props).toBe(null);

    props = getProps(null, null, {results: {nbHits: 666, processingTimeMS: 1}});
    expect(props).toEqual({nbHits: 666, processingTimeMS: 1});
  });
});
