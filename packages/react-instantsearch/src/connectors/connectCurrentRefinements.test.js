/* eslint-env jest, jasmine */

import connect from './connectCurrentRefinements.js';
jest.mock('../core/createConnector');

const { refine } = connect;

const context = { context: { ais: { mainTargetedIndex: 'index' } } };
const getProvidedProps = connect.getProvidedProps.bind(context);

describe('connectCurrentRefinements', () => {
  it('provides the correct props to the component', () => {
    let props = getProvidedProps({}, null, null, [
      { items: ['one'] },
      { items: ['two'] },
      { items: ['three'], id: 'query' },
    ]);
    expect(props.items).toEqual(['one', 'two']);

    props = getProvidedProps({}, null, null, []);
    expect(props).toEqual({ canRefine: false, items: [] });

    const transformItems = jest.fn(() => ['items']);
    props = getProvidedProps({ transformItems }, null, null, [
      { items: ['one'] },
      { items: ['two'] },
      { items: ['three'] },
    ]);
    expect(transformItems.mock.calls[0][0]).toEqual(['one', 'two', 'three']);
    expect(props.items).toEqual(['items']);
  });

  it('provides the query if clearsQuery props is true', () => {
    const results = {
      index: {
        query: 'query',
      },
    };

    const props = getProvidedProps({ clearsQuery: true }, null, { results }, [
      { items: [{ currentRefinement: 'query' }], id: 'query' },
    ]);

    expect(props.items).toEqual([{ currentRefinement: 'query' }]);
  });

  it('dont provide the query if clearsQuery props is true but the current refinement is an empty string', () => {
    const results = {
      index: {
        query: '',
      },
    };

    const props = getProvidedProps({ clearsQuery: true }, null, { results }, [
      { items: [{ currentRefinement: '' }], id: 'query' },
    ]);

    expect(props.items).toEqual([]);
  });

  it('refine applies the selected filters clear method on searchState', () => {
    let searchState = refine({}, { wow: 'sweet' }, [
      {
        value: nextState => ({ ...nextState, cool: 'neat' }),
      },
    ]);
    expect(searchState).toEqual({ wow: 'sweet', cool: 'neat' });

    searchState = refine({ clearsQuery: true }, { wow: 'sweet' }, [
      {
        value: nextState => ({ ...nextState, cool: 'neat' }),
      },
    ]);
    expect(searchState).toEqual({ wow: 'sweet', cool: 'neat' });
  });
});
