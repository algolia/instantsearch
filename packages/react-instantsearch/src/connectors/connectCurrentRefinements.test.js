/* eslint-env jest, jasmine */

import connect from './connectCurrentRefinements.js';
jest.mock('../core/createConnector');

const {refine, getProvidedProps} = connect;

describe('connectCurrentRefinements', () => {
  it('provides the correct props to the component', () => {
    let props = getProvidedProps({}, null, null, [
      {items: ['one']},
      {items: ['two']},
      {items: ['three']},
    ]);
    expect(props.items).toEqual(['one', 'two', 'three']);

    props = getProvidedProps({}, null, null, []);
    expect(props).toEqual({canRefine: false, items: []});

    const transformItems = jest.fn(() => ['items']);
    props = getProvidedProps({transformItems}, null, null, [
      {items: ['one']},
      {items: ['two']},
      {items: ['three']},
    ]);
    expect(transformItems.mock.calls[0][0]).toEqual(['one', 'two', 'three']);
    expect(props.items).toEqual(['items']);
  });

  it('refine applies the selected filters clear method on searchState', () => {
    const searchState = refine(null, {wow: 'sweet'}, [{
      value: nextState => ({...nextState, cool: 'neat'}),
    }]);
    expect(searchState).toEqual({wow: 'sweet', cool: 'neat'});
  });
});
