import connect from '../connectCurrentRefinements';

jest.mock('../../core/createConnector', () => x => x);

const { refine } = connect;

const context = { context: { ais: { mainTargetedIndex: 'index' } } };
const getProvidedProps = connect.getProvidedProps.bind(context);

describe('connectCurrentRefinements', () => {
  it('provides the correct props to the component', () => {
    let props = getProvidedProps({}, null, null, [
      { items: [{ label: 'one' }], id: 1, index: 'something' },
      { items: [{ label: 'two' }], id: 2, index: 'something' },
      { items: [{ label: 'three' }], id: 'query', index: 'something' },
    ]);
    expect(props.items).toEqual([
      { id: 1, index: 'something', label: 'one' },
      { id: 2, index: 'something', label: 'two' },
    ]);

    props = getProvidedProps({}, null, null, []);
    expect(props).toEqual({ canRefine: false, items: [] });

    const transformItems = jest.fn(() => ['items']);
    props = getProvidedProps({ transformItems }, null, null, [
      { items: [{ label: 'one' }], id: 1, index: 'something' },
      { items: [{ label: 'two' }], id: 2, index: 'something' },
      { items: [{ label: 'three' }], id: 3, index: 'something' },
    ]);
    expect(transformItems.mock.calls[0][0]).toEqual([
      { id: 1, index: 'something', label: 'one' },
      { id: 2, index: 'something', label: 'two' },
      { id: 3, index: 'something', label: 'three' },
    ]);
    expect(props.items).toEqual(['items']);
  });

  it('provides the query if clearsQuery props is true', () => {
    const results = {
      index: {
        query: 'query',
      },
    };

    const props = getProvidedProps({ clearsQuery: true }, null, { results }, [
      { items: [{ currentRefinement: 'query' }], id: 'query', index: '' },
    ]);

    expect(props.items).toEqual([
      { currentRefinement: 'query', id: 'query', index: '' },
    ]);
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

  it('deduplicates entries with transformItems', () => {
    const transformItems = items =>
      items
        .map(({ id, index, ...rest }) => ({
          __dedupe: `${index}.${id}`,
          id,
          index,
          ...rest,
        }))
        .sort((a, b) => a.id > b.__dedupe)
        .filter(
          (current, index, array) =>
            index === 0 || current.__dedupe !== array[index - 1].__dedupe
        )
        // eslint-disable-next-line no-unused-vars
        .map(({ __dedupe, ...item }) => item);

    const props = getProvidedProps({ transformItems }, null, null, [
      { items: [{ label: 'abra' }], id: 1, index: 'something' },
      { items: [{ label: 'cadabra' }], id: 2, index: 'something' },
      { items: [{ label: 'cadabra' }], id: 2, index: 'something' },
    ]);

    expect(props.items).toEqual([
      { id: 1, index: 'something', label: 'abra' },
      { id: 2, index: 'something', label: 'cadabra' },
    ]);
  });
});
