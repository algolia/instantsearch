/* eslint-env jest, jasmine */

import connectEmptyQuery from './connectEmptyQuery';
jest.unmock('./connectEmptyQuery');

const {getProps} = connectEmptyQuery;

let props;
describe('connectEmptyQuery', () => {
  it('provides the correct props to the component', () => {
    props = getProps({queryId: 'q'}, {q: ''});
    expect(props).toEqual({emptyQuery: true});

    props = getProps({queryId: 'q'}, {q: 'nope'});
    expect(props).toEqual({emptyQuery: false});
  });
});
