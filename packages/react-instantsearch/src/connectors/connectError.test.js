/* eslint-env jest, jasmine */

import connect from './connectError.js';
jest.mock('../core/createConnector');

const {getProps} = connect;

let props;
describe('connectError', () => {
  it('provides the correct props to the component', () => {
    props = getProps(null, null, {});
    expect(props).toBe(null);

    props = getProps(null, null, {error: 'yep'});
    expect(props).toEqual({error: 'yep'});
  });
});
