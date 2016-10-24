/* eslint-env jest, jasmine */

import connect from './connectLoading';
jest.mock('../core/createConnector');

const {getProps} = connect;

let props;
describe('connectLoading', () => {
  it('provides the correct props to the component', () => {
    props = getProps(null, null, {loading: false});
    expect(props).toEqual({loading: false});

    props = getProps(null, null, {loading: true});
    expect(props).toEqual({loading: true});
  });
});
