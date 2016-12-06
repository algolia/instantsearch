/* eslint-env jest, jasmine */

import connect from './connectCurrentRefinements.js';
jest.mock('../core/createConnector');

const {refine, getProvidedProps} = connect;

describe('connectCurrentRefinements', () => {
  it('provides the correct props to the component', () => {
    const props = getProvidedProps(null, null, null, [
      {items: ['one']},
      {items: ['two']},
      {items: ['three']},
    ]);
    expect(props.items).toEqual(['one', 'two', 'three']);
  });

  it('refine applies the selected filters clear method on searchState', () => {
    const searchState = refine(null, {wow: 'sweet'}, [{
      value: nextState => ({...nextState, cool: 'neat'}),
    }]);
    expect(searchState).toEqual({wow: 'sweet', cool: 'neat'});
  });
});
