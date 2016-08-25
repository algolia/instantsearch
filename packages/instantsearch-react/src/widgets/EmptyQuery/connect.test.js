/* eslint-env jest, jasmine */

import connect from './connect';
jest.unmock('./connect');

const {getProps} = connect;

let props;
describe('EmptyQuery.connect', () => {
  it('provides the correct props to the component', () => {
    props = getProps({queryId: 'q'}, {q: ''});
    expect(props).toEqual({emptyQuery: true});

    props = getProps({queryId: 'q'}, {q: 'nope'});
    expect(props).toEqual({emptyQuery: false});
  });
});
