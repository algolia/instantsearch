/* eslint-env jest, jasmine */

import connectCurrentFilters from './connectCurrentFilters';
jest.unmock('./connectCurrentFilters');

const {refine, getProps} = connectCurrentFilters;

describe('connectCurrentFilters', () => {
  it('provides the correct props to the component', () => {
    const props = getProps(null, null, null, [
      {filters: ['one']},
      {filters: ['two']},
      {filters: ['three']},
    ]);
    expect(props.filters).toEqual(['one', 'two', 'three']);
  });

  it('refine applies the selected filters clear method on state', () => {
    const state = refine(null, {wow: 'sweet'}, [{
      clear: nextState => ({...nextState, cool: 'neat'}),
    }]);
    expect(state).toEqual({wow: 'sweet', cool: 'neat'});
  });
});
