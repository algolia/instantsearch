/* eslint-env jest, jasmine */

import connectError from './connectError';
jest.unmock('./connectError');

const {getProps} = connectError;

let props;
describe('connectError', () => {
  it('provides the correct props to the component', () => {
    props = getProps(null, null, {});
    expect(props).toBe(null);

    props = getProps(null, null, {error: 'yep'});
    expect(props).toEqual({error: 'yep'});
  });
});
