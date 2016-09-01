/* eslint-env jest, jasmine */

import connect from './connect';
jest.mock('../../core/createConnector');

const {refine, getProps} = connect;

describe('CurrentFilters.connect', () => {
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
