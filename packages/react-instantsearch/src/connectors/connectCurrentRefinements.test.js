/* eslint-env jest, jasmine */

import connect from './connectCurrentRefinements.js';
jest.mock('../core/createConnector');

const {refine, getProps} = connect;

describe('connectCurrentRefinements', () => {
  it('provides the correct props to the component', () => {
    const props = getProps(null, null, null, [
      {items: ['one']},
      {items: ['two']},
      {items: ['three']},
    ]);
    expect(props.items).toEqual(['one', 'two', 'three']);
  });

  it('refine applies the selected filters clear method on state', () => {
    const state = refine(null, {wow: 'sweet'}, [{
      value: nextState => ({...nextState, cool: 'neat'}),
    }]);
    expect(state).toEqual({wow: 'sweet', cool: 'neat'});
  });
});
