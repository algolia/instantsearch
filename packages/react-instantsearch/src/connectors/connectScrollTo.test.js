/* eslint-env jest, jasmine */

import connect from './connectScrollTo';
jest.mock('../core/createConnector');

const {getProps} = connect;

let props;
describe('connectScrollTo', () => {
  it('provides the correct props to the component', () => {
    props = getProps({scrollOn: 'p'}, {p: 1});
    expect(props).toEqual({value: 1});

    props = getProps({scrollOn: 'anything'}, {anything: 2});
    expect(props).toEqual({value: 2});
  });
});
