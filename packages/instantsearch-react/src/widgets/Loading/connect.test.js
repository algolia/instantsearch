/* eslint-env jest, jasmine */

import connect from './connect';
jest.unmock('./connect');

const {getProps} = connect;

let props;
describe('Loading.connect', () => {
  it('provides the correct props to the component', () => {
    props = getProps(null, null, {loading: false});
    expect(props).toEqual({loading: false});

    props = getProps(null, null, {loading: true});
    expect(props).toEqual({loading: true});
  });
});
