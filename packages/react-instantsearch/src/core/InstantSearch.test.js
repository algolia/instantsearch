import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import createInstantSearchManager from './createInstantSearchManager';
import InstantSearch from './InstantSearch';

Enzyme.configure({ adapter: new Adapter() });

jest.mock('./createInstantSearchManager', () =>
  jest.fn(() => ({
    context: {},
  }))
);

const DEFAULT_PROPS = {
  appId: 'foo',
  apiKey: 'bar',
  indexName: 'foobar',
  algoliaClient: {},
  searchParameters: {},
  root: {
    Root: 'div',
  },
  refresh: false,
};

describe('InstantSearch', () => {
  afterEach(() => {
    createInstantSearchManager.mockClear();
  });

  it('validates its props', () => {
    expect(() => {
      shallow(
        <InstantSearch {...DEFAULT_PROPS}>
          <div />
        </InstantSearch>
      );
    }).not.toThrow();

    expect(() => {
      shallow(<InstantSearch {...DEFAULT_PROPS} />);
    }).not.toThrow();

    expect(() => {
      shallow(
        <InstantSearch {...DEFAULT_PROPS}>
          <div />
          <div />
        </InstantSearch>
      );
    }).not.toThrow();

    expect(() => {
      const wrapper = shallow(
        <InstantSearch
          {...DEFAULT_PROPS}
          searchState={{}}
          onSearchStateChange={() => null}
          createURL={() => null}
          refresh={false}
        >
          <div />
        </InstantSearch>
      );
      wrapper.setProps({
        searchState: undefined,
      });
    }).toThrowError(
      "You can't switch <InstantSearch> from being controlled to uncontrolled"
    );

    expect(() => {
      const wrapper = shallow(
        <InstantSearch {...DEFAULT_PROPS}>
          <div />
        </InstantSearch>
      );
      wrapper.setProps({
        searchState: {},
        onSearchStateChange: () => null,
        createURL: () => null,
      });
    }).toThrowError(
      "You can't switch <InstantSearch> from being uncontrolled to controlled"
    );

    expect(() => {
      const wrapper = shallow(
        <InstantSearch
          {...DEFAULT_PROPS}
          searchState={{}}
          onSearchStateChange={() => null}
          createURL={() => null}
        >
          <div />
        </InstantSearch>
      );
      wrapper.setProps({
        searchState: undefined,
        onSearchStateChange: undefined,
        createURL: undefined,
      });
    }).toThrowError(
      "You can't switch <InstantSearch> from being controlled to uncontrolled"
    );
  });

  it('correctly instantiates the isManager', () => {
    mount(
      <InstantSearch {...DEFAULT_PROPS}>
        <div />
      </InstantSearch>
    );
    expect(createInstantSearchManager.mock.calls[0][0]).toEqual({
      indexName: DEFAULT_PROPS.indexName,
      initialState: {},
      searchParameters: {},
      algoliaClient: {},
      stalledSearchDelay: 200,
    });
  });

  it('updates Algolia client when new one is given in props', () => {
    const ism = {
      updateClient: jest.fn(),
    };

    createInstantSearchManager.mockImplementation(() => ism);

    const wrapper = mount(
      <InstantSearch {...DEFAULT_PROPS}>
        <div />
      </InstantSearch>
    );

    expect(ism.updateClient.mock.calls).toHaveLength(0);
    wrapper.setProps({
      ...DEFAULT_PROPS,
      algoliaClient: {},
    });

    expect(ism.updateClient.mock.calls).toHaveLength(1);
  });

  it('works as a controlled input', () => {
    const ism = {
      transitionState: searchState => ({ ...searchState, transitioned: true }),
      onExternalStateUpdate: jest.fn(),
    };
    createInstantSearchManager.mockImplementation(() => ism);
    const initialState = { a: 0 };
    const onSearchStateChange = jest.fn(searchState => {
      // eslint-disable-next-line no-use-before-define
      wrapper.setProps({
        searchState: { a: searchState.a + 1 },
      });
    });
    const wrapper = mount(
      <InstantSearch
        {...DEFAULT_PROPS}
        searchState={initialState}
        onSearchStateChange={onSearchStateChange}
        createURL={() => '#'}
      >
        <div />
      </InstantSearch>
    );
    expect(createInstantSearchManager.mock.calls[0][0].initialState).toBe(
      initialState
    );
    const {
      ais: { onInternalStateUpdate },
    } = wrapper.instance().getChildContext();
    onInternalStateUpdate({ a: 1 });
    expect(onSearchStateChange.mock.calls[0][0]).toEqual({
      transitioned: true,
      a: 1,
    });
    expect(ism.onExternalStateUpdate.mock.calls[0][0]).toEqual({
      a: 2,
    });
  });

  it('works as an uncontrolled input', () => {
    const ism = {
      transitionState: searchState => ({ ...searchState, transitioned: true }),
      onExternalStateUpdate: jest.fn(),
    };
    createInstantSearchManager.mockImplementation(() => ism);

    const wrapper = mount(
      <InstantSearch {...DEFAULT_PROPS}>
        <div />
      </InstantSearch>
    );

    const nextState = { a: 1 };
    const {
      ais: { onInternalStateUpdate },
    } = wrapper.instance().getChildContext();
    onInternalStateUpdate(nextState);
    expect(ism.onExternalStateUpdate.mock.calls[0][0]).toEqual({
      a: 1,
      transitioned: true,
    });

    const onSearchStateChange = jest.fn();
    wrapper.setProps({ onSearchStateChange });
    onInternalStateUpdate({ a: 2 });
    expect(onSearchStateChange.mock.calls[0][0]).toEqual({
      a: 2,
      transitioned: true,
    });
  });

  it("exposes the isManager's store and widgetsManager in context", () => {
    const ism = {
      store: {},
      widgetsManager: {},
    };
    createInstantSearchManager.mockImplementation(() => ism);
    const wrapper = mount(
      <InstantSearch {...DEFAULT_PROPS}>
        <div />
      </InstantSearch>
    );

    const context = wrapper.instance().getChildContext();
    expect(context.ais.store).toBe(ism.store);
    expect(context.ais.widgetsManager).toBe(ism.widgetsManager);
  });

  it('onSearchStateChange should not be called and search should be skipped if the widget is unmounting', () => {
    const ism = {
      skipSearch: jest.fn(),
    };
    createInstantSearchManager.mockImplementation(() => ism);
    const onSearchStateChangeMock = jest.fn();
    const wrapper = mount(
      <InstantSearch
        {...DEFAULT_PROPS}
        onSearchStateChange={onSearchStateChangeMock}
      >
        <div />
      </InstantSearch>
    );
    const {
      ais: { onSearchStateChange },
    } = wrapper.instance().getChildContext();

    wrapper.unmount();
    onSearchStateChange({});

    expect(onSearchStateChangeMock.mock.calls).toHaveLength(0);
    expect(ism.skipSearch.mock.calls).toHaveLength(1);
  });

  it('refreshes the cache when the refresh prop is set to true', () => {
    const ism = {
      clearCache: jest.fn(),
    };

    createInstantSearchManager.mockImplementation(() => ism);

    const wrapper = shallow(
      <InstantSearch {...DEFAULT_PROPS}>
        <div />
      </InstantSearch>
    );

    expect(ism.clearCache).not.toHaveBeenCalled();

    wrapper.setProps({
      ...DEFAULT_PROPS,
      refresh: false,
    });

    expect(ism.clearCache).not.toHaveBeenCalled();

    wrapper.setProps({
      ...DEFAULT_PROPS,
      refresh: true,
    });

    expect(ism.clearCache).toHaveBeenCalledTimes(1);
  });

  it('updates the index when the the index changes', () => {
    const ism = {
      updateIndex: jest.fn(),
    };

    createInstantSearchManager.mockImplementation(() => ism);

    const wrapper = shallow(
      <InstantSearch {...DEFAULT_PROPS}>
        <div />
      </InstantSearch>
    );

    expect(ism.updateIndex).not.toHaveBeenCalled();

    wrapper.setProps({
      indexName: 'foobar',
    });

    expect(ism.updateIndex).not.toHaveBeenCalled();

    wrapper.setProps({
      indexName: 'newindexname',
    });

    expect(ism.updateIndex).toHaveBeenCalledTimes(1);
  });

  it('calls onSearchParameters with the right values if function provided', () => {
    const ism = {
      store: {},
      widgetsManager: {},
    };
    createInstantSearchManager.mockImplementation(() => ism);
    const onSearchParametersMock = jest.fn();
    const getSearchParameters = jest.fn();
    const context = { context: 'some' };
    const props = { props: 'some' };
    let wrapper = mount(
      <InstantSearch
        {...DEFAULT_PROPS}
        onSearchParameters={onSearchParametersMock}
      >
        <div />
      </InstantSearch>
    );
    let childContext = wrapper.instance().getChildContext();

    childContext.ais.onSearchParameters(getSearchParameters, context, props);

    expect(onSearchParametersMock.mock.calls).toHaveLength(1);
    expect(onSearchParametersMock.mock.calls[0][0]).toBe(getSearchParameters);
    expect(onSearchParametersMock.mock.calls[0][1]).toEqual(context);
    expect(onSearchParametersMock.mock.calls[0][2]).toEqual(props);
    expect(onSearchParametersMock.mock.calls[0][3]).toEqual({});

    wrapper = mount(
      <InstantSearch
        {...DEFAULT_PROPS}
        onSearchParameters={onSearchParametersMock}
        searchState={{ search: 'state' }}
      >
        <div />
      </InstantSearch>
    );

    childContext = wrapper.instance().getChildContext();

    childContext.ais.onSearchParameters(getSearchParameters, context, props);

    expect(onSearchParametersMock.mock.calls).toHaveLength(2);
    expect(onSearchParametersMock.mock.calls[1][3]).toEqual({
      search: 'state',
    });

    wrapper = mount(
      <InstantSearch {...DEFAULT_PROPS}>
        <div />
      </InstantSearch>
    );

    childContext = wrapper.instance().getChildContext();

    childContext.ais.onSearchParameters(getSearchParameters, context, props);

    expect(onSearchParametersMock.mock.calls).toHaveLength(2);
  });

  describe('createHrefForState', () => {
    it('passes through to createURL when it is defined', () => {
      const widgetsIds = [];
      const ism = {
        transitionState: searchState => ({
          ...searchState,
          transitioned: true,
        }),
        getWidgetsIds: () => widgetsIds,
      };
      createInstantSearchManager.mockImplementation(() => ism);
      const createURL = jest.fn(searchState => searchState);

      const wrapper = mount(
        <InstantSearch
          {...DEFAULT_PROPS}
          searchState={{}}
          onSearchStateChange={() => null}
          createURL={createURL}
        >
          <div />
        </InstantSearch>
      );

      const {
        ais: { createHrefForState },
      } = wrapper.instance().getChildContext();
      const outputURL = createHrefForState({ a: 1 });
      expect(outputURL).toEqual({ a: 1, transitioned: true });
      expect(createURL.mock.calls[0][1]).toBe(widgetsIds);
    });

    it('returns # otherwise', () => {
      const wrapper = mount(
        <InstantSearch {...DEFAULT_PROPS}>
          <div />
        </InstantSearch>
      );

      const {
        ais: { createHrefForState },
      } = wrapper.instance().getChildContext();
      const outputURL = createHrefForState({ a: 1 });
      expect(outputURL).toBe('#');
    });

    it('search for facet values should be called if triggered', () => {
      const ism = {
        onSearchForFacetValues: jest.fn(),
      };
      createInstantSearchManager.mockImplementation(() => ism);
      const wrapper = mount(
        <InstantSearch {...DEFAULT_PROPS}>
          <div />
        </InstantSearch>
      );
      const {
        ais: { onSearchForFacetValues },
      } = wrapper.instance().getChildContext();
      onSearchForFacetValues({ a: 1 });
      expect(ism.onSearchForFacetValues.mock.calls[0][0]).toEqual({ a: 1 });
    });
  });
});
