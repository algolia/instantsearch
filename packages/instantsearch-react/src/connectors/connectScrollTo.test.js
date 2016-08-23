/* eslint-env jest, jasmine */

import connectScrollTo from './connectScrollTo';
jest.unmock('./connectScrollTo');

const {getProps} = connectScrollTo;

let props;
describe('connectScrollTo', () => {
  it('provides the correct props to the component', () => {
    props = getProps({listenTo: 'p'}, {p: 1});
    expect(props).toEqual({value: 1});

    props = getProps({listenTo: 'anything'}, {anything: 2});
    expect(props).toEqual({value: 2});
  });
});
