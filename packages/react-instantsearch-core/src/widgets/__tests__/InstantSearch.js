/**
 * @jest-environment jsdom
 */

import { wait } from '@instantsearch/testutils';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { shallow, mount } from 'enzyme';
import React from 'react';

import { InstantSearchConsumer } from '../../core/context';
import createInstantSearchManager from '../../core/createInstantSearchManager';
import InstantSearch from '../InstantSearch';

Enzyme.configure({ adapter: new Adapter() });

jest.mock('../../core/createInstantSearchManager');

const createFakeStore = (rest = {}) => ({
  getState: jest.fn(() => ({})),
  setState: jest.fn(),
  subscribe: jest.fn(),
  ...rest,
});

const createFakeInstantSearchManager = (rest = {}) => ({
  context: {},
  store: createFakeStore(),
  clearCache: jest.fn(),
  updateIndex: jest.fn(),
  updateClient: jest.fn(),
  skipSearch: jest.fn(),
  getWidgetsIds: jest.fn(),
  onExternalStateUpdate: jest.fn(),
  onSearchForFacetValues: jest.fn(),
  transitionState: jest.fn(),
  ...rest,
});

const createFakeSearchClient = (rest = {}) => ({
  search: jest.fn(),
  ...rest,
});

const DEFAULT_PROPS = {
  appId: 'foo',
  apiKey: 'bar',
  indexName: 'foobar',
  searchClient: createFakeSearchClient(),
  root: {
    Root: 'div',
  },
  refresh: false,
};

describe('InstantSearch', () => {
  beforeEach(() => {
    createInstantSearchManager.mockImplementation(() =>
      createFakeInstantSearchManager()
    );
  });

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
    }).toThrow(
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
    }).toThrow(
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
    }).toThrow(
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
      searchClient: DEFAULT_PROPS.searchClient,
      stalledSearchDelay: 200,
    });
  });

  it('updates Algolia client when new one is given in props', () => {
    const ism = createFakeInstantSearchManager();

    createInstantSearchManager.mockImplementation(() => ism);

    const wrapper = mount(
      <InstantSearch {...DEFAULT_PROPS}>
        <div />
      </InstantSearch>
    );

    expect(ism.updateClient).toHaveBeenCalledTimes(0);

    wrapper.setProps({
      ...DEFAULT_PROPS,
      searchClient: createFakeSearchClient(),
    });

    expect(ism.updateClient).toHaveBeenCalledTimes(1);
  });

  it('works as a controlled input', () => {
    const ism = createFakeInstantSearchManager({
      transitionState: (searchState) => ({
        ...searchState,
        transitioned: true,
      }),
    });
    createInstantSearchManager.mockImplementation(() => ism);
    const initialState = { a: 0 };
    const onSearchStateChange = jest.fn((searchState) => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
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
        <InstantSearchConsumer>
          {(contextValue) => (
            <button
              onClick={() => contextValue.onInternalStateUpdate({ a: 1 })}
            />
          )}
        </InstantSearchConsumer>
      </InstantSearch>
    );

    expect(createInstantSearchManager).toHaveBeenCalledWith(
      expect.objectContaining({
        initialState,
      })
    );

    wrapper.find('button').simulate('click');

    expect(onSearchStateChange).toHaveBeenLastCalledWith({
      transitioned: true,
      a: 1,
    });

    expect(ism.onExternalStateUpdate).toHaveBeenLastCalledWith({
      a: 2,
    });
  });

  it('keeps the `searchState` up to date as a controlled input', () => {
    createInstantSearchManager.mockImplementation((...args) => {
      const module = jest.requireActual(
        '../../core/createInstantSearchManager'
      );

      return module.default(...args);
    });

    const widget = jest.fn(() => null);
    const initialState = { a: 0 };
    const onSearchStateChange = (searchState) => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      wrapper.setProps({
        searchState: { a: searchState.a + 1 },
      });
    };

    const wrapper = mount(
      <InstantSearch
        {...DEFAULT_PROPS}
        searchState={initialState}
        onSearchStateChange={onSearchStateChange}
        createURL={() => '#'}
      >
        <InstantSearchConsumer>
          {(contextValue) => (
            <React.Fragment>
              {widget(contextValue.store.getState().widgets)}
              <button
                onClick={() => contextValue.onInternalStateUpdate({ a: 1 })}
              />
            </React.Fragment>
          )}
        </InstantSearchConsumer>
      </InstantSearch>
    );

    expect(widget).toHaveBeenCalledTimes(1);
    expect(widget).toHaveBeenLastCalledWith({
      a: 0,
    });

    wrapper.find('button').simulate('click');

    expect(widget).toHaveBeenCalledTimes(2);
    expect(widget).toHaveBeenLastCalledWith({
      a: 2,
    });
  });

  it('works as an uncontrolled input', () => {
    const ism = createFakeInstantSearchManager({
      transitionState: (searchState) => ({
        ...searchState,
        transitioned: true,
      }),
    });
    createInstantSearchManager.mockImplementation(() => ism);

    const wrapper = mount(
      <InstantSearch {...DEFAULT_PROPS}>
        <InstantSearchConsumer>
          {(contextValue) => (
            <button
              onClick={({ nextState }) =>
                contextValue.onInternalStateUpdate(nextState)
              }
            />
          )}
        </InstantSearchConsumer>
      </InstantSearch>
    );

    wrapper.find('button').simulate('click', { nextState: { a: 1 } });

    expect(ism.onExternalStateUpdate.mock.calls[0][0]).toEqual({
      a: 1,
      transitioned: true,
    });

    const onSearchStateChange = jest.fn();
    wrapper.setProps({ onSearchStateChange });

    wrapper.find('button').simulate('click', { nextState: { a: 2 } });

    expect(onSearchStateChange.mock.calls[0][0]).toEqual({
      a: 2,
      transitioned: true,
    });
  });

  it("exposes the isManager's store and widgetsManager in context", () => {
    const ism = createFakeInstantSearchManager();
    createInstantSearchManager.mockImplementation(() => ism);
    let childContext = false;
    mount(
      <InstantSearch {...DEFAULT_PROPS}>
        <InstantSearchConsumer>
          {(contextValue) => {
            childContext = contextValue;
            return null;
          }}
        </InstantSearchConsumer>
      </InstantSearch>
    );

    expect(childContext.store).toBe(ism.store);
    expect(childContext.widgetsManager).toBe(ism.widgetsManager);
  });

  it('onSearchStateChange should not be called and search should be skipped if the widget is unmounted', async () => {
    const ism = createFakeInstantSearchManager();
    let childContext;
    createInstantSearchManager.mockImplementation(() => ism);
    const onSearchStateChangeMock = jest.fn();
    const wrapper = mount(
      <InstantSearch
        {...DEFAULT_PROPS}
        onSearchStateChange={onSearchStateChangeMock}
      >
        <InstantSearchConsumer>
          {(contextValue) => {
            childContext = contextValue;
            return null;
          }}
        </InstantSearchConsumer>
      </InstantSearch>
    );

    wrapper.unmount();

    await wait(0);

    childContext.onSearchStateChange({});

    expect(onSearchStateChangeMock).toHaveBeenCalledTimes(0);
    expect(ism.skipSearch).toHaveBeenCalledTimes(1);
  });

  it('refreshes the cache when the refresh prop is set to true', () => {
    const ism = createFakeInstantSearchManager();

    createInstantSearchManager.mockImplementation(() => ism);

    const wrapper = mount(
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

  it('refreshes the cache only once if the refresh prop stay to true', () => {
    const ism = createFakeInstantSearchManager();

    createInstantSearchManager.mockImplementation(() => ism);

    const wrapper = mount(
      <InstantSearch {...DEFAULT_PROPS}>
        <div />
      </InstantSearch>
    );

    expect(ism.clearCache).not.toHaveBeenCalled();

    wrapper.setProps({
      ...DEFAULT_PROPS,
      refresh: true,
    });

    expect(ism.clearCache).toHaveBeenCalledTimes(1);

    wrapper.setProps({
      indexName: DEFAULT_PROPS.indexName,
    });

    expect(ism.clearCache).toHaveBeenCalledTimes(1);
  });

  it('updates the index when the the index changes', () => {
    const ism = createFakeInstantSearchManager();

    createInstantSearchManager.mockImplementation(() => ism);

    const wrapper = mount(
      <InstantSearch {...DEFAULT_PROPS}>
        <InstantSearchConsumer>
          {(contextValue) => contextValue.mainTargetedIndex}
        </InstantSearchConsumer>
      </InstantSearch>
    );

    expect(wrapper.text()).toMatchInlineSnapshot(`"foobar"`);

    // setting the same prop
    wrapper.setProps({
      indexName: 'foobar',
    });

    expect(ism.updateIndex).not.toHaveBeenCalled();

    expect(wrapper.text()).toMatchInlineSnapshot(`"foobar"`);

    // changing the prop
    wrapper.setProps({
      indexName: 'newIndexName',
    });

    expect(ism.updateIndex).toHaveBeenCalledWith('newIndexName');

    expect(wrapper.text()).toMatchInlineSnapshot(`"newIndexName"`);
  });

  it('calls onSearchParameters with the right values if function provided', () => {
    const ism = createFakeInstantSearchManager();
    createInstantSearchManager.mockImplementation(() => ism);
    const onSearchParametersMock = jest.fn();
    const getSearchParameters = jest.fn();
    const context = { context: 'some' };
    const props = { props: 'some' };
    let childContext;
    mount(
      <InstantSearch
        {...DEFAULT_PROPS}
        onSearchParameters={onSearchParametersMock}
      >
        <InstantSearchConsumer>
          {(contextValue) => {
            childContext = contextValue;
            return null;
          }}
        </InstantSearchConsumer>
      </InstantSearch>
    );

    childContext.onSearchParameters(getSearchParameters, context, props);

    expect(onSearchParametersMock).toHaveBeenCalledTimes(1);
    expect(onSearchParametersMock.mock.calls[0][0]).toBe(getSearchParameters);
    expect(onSearchParametersMock.mock.calls[0][1]).toEqual(context);
    expect(onSearchParametersMock.mock.calls[0][2]).toEqual(props);
    expect(onSearchParametersMock.mock.calls[0][3]).toEqual({});

    mount(
      <InstantSearch
        {...DEFAULT_PROPS}
        onSearchParameters={onSearchParametersMock}
        searchState={{ search: 'state' }}
      >
        <InstantSearchConsumer>
          {(contextValue) => {
            childContext = contextValue;
            return null;
          }}
        </InstantSearchConsumer>
      </InstantSearch>
    );

    childContext.onSearchParameters(getSearchParameters, context, props);

    expect(onSearchParametersMock).toHaveBeenCalledTimes(2);
    expect(onSearchParametersMock.mock.calls[1][3]).toEqual({
      search: 'state',
    });

    mount(
      <InstantSearch {...DEFAULT_PROPS}>
        <InstantSearchConsumer>
          {(contextValue) => {
            childContext = contextValue;
            return null;
          }}
        </InstantSearchConsumer>
      </InstantSearch>
    );

    childContext.onSearchParameters(getSearchParameters, context, props);

    expect(onSearchParametersMock).toHaveBeenCalledTimes(2);
  });

  describe('createHrefForState', () => {
    it('passes through to createURL when it is defined', () => {
      const widgetsIds = [];
      const ism = createFakeInstantSearchManager({
        transitionState: (searchState) => ({
          ...searchState,
          transitioned: true,
        }),
        getWidgetsIds: () => widgetsIds,
      });
      createInstantSearchManager.mockImplementation(() => ism);
      const createURL = jest.fn((searchState) => searchState);

      let childContext;
      mount(
        <InstantSearch
          {...DEFAULT_PROPS}
          searchState={{}}
          onSearchStateChange={() => null}
          createURL={createURL}
        >
          <InstantSearchConsumer>
            {(contextValue) => {
              childContext = contextValue;
              return null;
            }}
          </InstantSearchConsumer>
        </InstantSearch>
      );

      const { createHrefForState } = childContext;
      const outputURL = createHrefForState({ a: 1 });
      expect(outputURL).toEqual({ a: 1, transitioned: true });
      expect(createURL.mock.calls[0][1]).toBe(widgetsIds);
    });

    it('returns # otherwise', () => {
      let childContext;
      mount(
        <InstantSearch {...DEFAULT_PROPS}>
          <InstantSearchConsumer>
            {(contextValue) => {
              childContext = contextValue;
              return null;
            }}
          </InstantSearchConsumer>
        </InstantSearch>
      );

      const { createHrefForState } = childContext;
      const outputURL = createHrefForState({ a: 1 });
      expect(outputURL).toBe('#');
    });

    it('search for facet values should be called if triggered', () => {
      const ism = createFakeInstantSearchManager();
      createInstantSearchManager.mockImplementation(() => ism);
      let childContext;
      mount(
        <InstantSearch {...DEFAULT_PROPS}>
          <InstantSearchConsumer>
            {(contextValue) => {
              childContext = contextValue;
              return null;
            }}
          </InstantSearchConsumer>
        </InstantSearch>
      );
      const { onSearchForFacetValues } = childContext;
      onSearchForFacetValues({ a: 1 });
      expect(ism.onSearchForFacetValues.mock.calls[0][0]).toEqual({ a: 1 });
    });
  });
});
