import connect from '../connectScrollTo';

jest.mock('../../core/createConnector', () => (x) => x);

let props;
describe('connectScrollTo', () => {
  describe('single index', () => {
    const contextValue = { mainTargetedIndex: 'index' };
    it('provides the correct props to the component', () => {
      const instance = {};
      props = connect.getProvidedProps.call(
        instance,
        { scrollOn: 'p', contextValue },
        { p: 1, configure: 3, refinementList: 'ok' }
      );
      expect(props).toEqual({ value: 1, hasNotChanged: false });

      props = connect.getProvidedProps.call(
        instance,
        { scrollOn: 'p', contextValue },
        { p: 1, configure: 3, refinementList: 'not ok' }
      );
      expect(props).toEqual({ value: 1, hasNotChanged: false });

      props = connect.getProvidedProps.call(
        instance,
        { scrollOn: 'p', contextValue },
        { p: 2, configure: 3, refinementList: 'not ok' }
      );
      expect(props).toEqual({ value: 2, hasNotChanged: true });

      props = connect.getProvidedProps.call(
        instance,
        { scrollOn: 'anything', contextValue },
        { anything: 2 }
      );
      expect(props).toEqual({ value: 2, hasNotChanged: false });
    });
  });

  describe('multi index', () => {
    const contextValue = { mainTargetedIndex: 'first' };
    const indexContextValue = { targetedIndex: 'second' };
    it('provides the correct props to the component', () => {
      const instance = {};
      const searchState = { indices: { second: { p: 1 } } };

      props = connect.getProvidedProps.call(
        instance,
        { scrollOn: 'p', contextValue, indexContextValue },
        searchState
      );
      expect(props).toEqual({ value: 1, hasNotChanged: true });

      searchState.indices.second = { ...searchState.indices.second, p: 2 };

      props = connect.getProvidedProps.call(
        instance,
        { scrollOn: 'p', contextValue, indexContextValue },
        searchState
      );
      expect(props).toEqual({ value: 2, hasNotChanged: true });

      searchState.indices.second = {
        ...searchState.indices.second,
        anything: 'ok',
      };

      props = connect.getProvidedProps.call(
        instance,
        { scrollOn: 'p', contextValue, indexContextValue },
        searchState
      );
      expect(props).toEqual({ value: 2, hasNotChanged: false });
    });
  });
});
