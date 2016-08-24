/* eslint-env jest, jasmine */

import connectScrollTo from './connectScrollTo';
jest.unmock('./connectScrollTo');

const {getProps} = connectScrollTo;

let props;
describe('connectScrollTo', () => {
  it('provides the correct props to the component', () => {
    props = getProps({scrollOn: 'p'}, {p: 1});
    expect(props).toEqual({value: 1});

    props = getProps({scrollOn: 'anything'}, {anything: 2});
    expect(props).toEqual({value: 2});
  });
});
