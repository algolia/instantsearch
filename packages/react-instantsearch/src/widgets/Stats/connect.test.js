/* eslint-env jest, jasmine */

import connect from './connect';
jest.mock('../../core/createConnector');

const {getProps} = connect;

let props;
describe('Stats.connect', () => {
  it('provides the correct props to the component', () => {
    props = getProps(null, null, {});
    expect(props).toBe(null);

    props = getProps(null, null, {results: {nbHits: 666, processingTimeMS: 1}});
    expect(props).toEqual({nbHits: 666, processingTimeMS: 1});
  });
});
