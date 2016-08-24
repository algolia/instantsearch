/* eslint-env jest, jasmine */

import connect from './connect';
jest.unmock('./connect');

const {getProps} = connect;

let props;
describe('Error.connect', () => {
  it('provides the correct props to the component', () => {
    props = getProps(null, null, {});
    expect(props).toBe(null);

    props = getProps(null, null, {error: 'yep'});
    expect(props).toEqual({error: 'yep'});
  });
});
