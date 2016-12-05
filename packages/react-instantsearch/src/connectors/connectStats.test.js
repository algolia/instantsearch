/* eslint-env jest, jasmine */

import connect from './connectStats';
jest.mock('../core/createConnector');

const {getProvidedProps} = connect;

let props;
describe('connectStats', () => {
  it('provides the correct props to the component', () => {
    props = getProvidedProps(null, null, {});
    expect(props).toBe(null);

    props = getProvidedProps(null, null, {results: {nbHits: 666, processingTimeMS: 1}});
    expect(props).toEqual({nbHits: 666, processingTimeMS: 1});
  });
});
