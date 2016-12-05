/* eslint-env jest, jasmine */

import connect from './connectScrollTo';
jest.mock('../core/createConnector');

const {getProvidedProps} = connect;

let props;
describe('connectScrollTo', () => {
  it('provides the correct props to the component', () => {
    props = getProvidedProps({scrollOn: 'p'}, {p: 1});
    expect(props).toEqual({value: 1});

    props = getProvidedProps({scrollOn: 'anything'}, {anything: 2});
    expect(props).toEqual({value: 2});
  });
});
