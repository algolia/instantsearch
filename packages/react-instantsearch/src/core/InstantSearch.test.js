/* eslint-env jest, jasmine */
/* eslint-disable max-len */

import React from 'react';
import {mount} from 'enzyme';

import InstantSearch from './InstantSearch';

import createInstantSearchManager from './createInstantSearchManager';
jest.mock('./createInstantSearchManager', () => jest.fn(() => ({
  context: {},
})));

const DEFAULT_PROPS = {
  appId: 'foo',
  apiKey: 'bar',
  indexName: 'foobar',
  urlSync: false,
};

describe('InstantSearch', () => {
  afterEach(() => {
    createInstantSearchManager.mockClear();
  });

  it('validates its props', () => {
    expect(() => {
      mount(
        <InstantSearch {...DEFAULT_PROPS}>
          <div />
        </InstantSearch>
      );
    }).not.toThrow();

    expect(() => {
      mount(
        <InstantSearch {...DEFAULT_PROPS}>
        </InstantSearch>
      );
    }).not.toThrow();

    expect(() => {
      mount(
        <InstantSearch {...DEFAULT_PROPS}>
          <div />
          <div />
        </InstantSearch>
      );
    }).toThrow();

    expect(() => {
      mount(
        <InstantSearch
          {...DEFAULT_PROPS}
          state={{}}
        >
          <div />
        </InstantSearch>
      );
    }).toThrowError('You must provide an `onStateChange` function as a prop if you want to manage the state of <InstantSearch>');

    expect(() => {
      mount(
        <InstantSearch
          {...DEFAULT_PROPS}
          state={{}}
          createURL={() => null}
        >
          <div />
        </InstantSearch>
      );
    }).toThrowError('You must provide an `onStateChange` function as a prop if you want to manage the state of <InstantSearch>');

    expect(() => {
      const wrapper = mount(
        <InstantSearch
          {...DEFAULT_PROPS}
          state={{}}
          onStateChange={() => null}
          createURL={() => null}
        >
          <div />
        </InstantSearch>
      );
      wrapper.setProps({
        state: undefined,
      });
    }).toThrowError('You can\'t switch <InstantSearch> from being controlled to uncontrolled');

    expect(() => {
      const wrapper = mount(
        <InstantSearch {...DEFAULT_PROPS}>
          <div />
        </InstantSearch>
      );
      wrapper.setProps({
        state: {},
        onStateChange: () => null,
        createURL: () => null,
      });
    }).toThrowError('You can\'t switch <InstantSearch> from being uncontrolled to controlled');

    expect(() => {
      const wrapper = mount(
        <InstantSearch
          {...DEFAULT_PROPS}
          state={{}}
          onStateChange={() => null}
          createURL={() => null}
        >
          <div />
        </InstantSearch>
      );
      wrapper.setProps({
        state: undefined,
        onStateChange: undefined,
        createURL: undefined,
      });
    }).toThrowError('You can\'t switch <InstantSearch> from being controlled to uncontrolled');
  });

  it('correctly instantiates the isManager', () => {
    mount(
      <InstantSearch {...DEFAULT_PROPS}>
        <div />
      </InstantSearch>
    );
    expect(createInstantSearchManager.mock.calls[0][0]).toEqual({
      appId: DEFAULT_PROPS.appId,
      apiKey: DEFAULT_PROPS.apiKey,
      indexName: DEFAULT_PROPS.indexName,
      initialState: {},
    });
  });

  it('works as a controlled input', () => {
    const ism = {
      transitionState: state => ({...state, transitioned: true}),
      onExternalStateUpdate: jest.fn(),
    };
    createInstantSearchManager.mockImplementation(() => ism);
    const initialState = {a: 0};
    const onStateChange = jest.fn(state => {
      // eslint-disable-next-line no-use-before-define
      wrapper.setProps({
        state: {a: state.a + 1},
      });
    });
    const wrapper = mount(
      <InstantSearch
        {...DEFAULT_PROPS}
        state={initialState}
        onStateChange={onStateChange}
        createURL={() => '#'}
      >
        <div />
      </InstantSearch>
    );
    expect(createInstantSearchManager.mock.calls[0][0].initialState).toBe(initialState);
    const {ais: {onInternalStateUpdate}} = wrapper.instance().getChildContext();
    onInternalStateUpdate({a: 1});
    expect(onStateChange.mock.calls[0][0]).toEqual({
      transitioned: true,
      a: 1,
    });
    expect(ism.onExternalStateUpdate.mock.calls[0][0]).toEqual({
      a: 2,
    });
  });

  it('works as an uncontrolled input', () => {
    const ism = {
      transitionState: state => ({...state, transitioned: true}),
      onExternalStateUpdate: jest.fn(),
    };
    createInstantSearchManager.mockImplementation(() => ism);

    const wrapper = mount(
      <InstantSearch {...DEFAULT_PROPS}>
        <div />
      </InstantSearch>
    );

    const nextState = {a: 1};
    const {ais: {onInternalStateUpdate}} = wrapper.instance().getChildContext();
    onInternalStateUpdate(nextState);
    expect(ism.onExternalStateUpdate.mock.calls[0][0]).toEqual({
      a: 1,
      transitioned: true,
    });

    const onStateChange = jest.fn();
    wrapper.setProps({onStateChange});
    onInternalStateUpdate({a: 2});
    expect(onStateChange.mock.calls[0][0]).toEqual({a: 2, transitioned: true});
  });

  it('exposes the isManager\'s store and widgetsManager in context', () => {
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

  describe('createHrefForState', () => {
    it('passes through to createURL when it is defined', () => {
      const widgetsIds = [];
      const ism = {
        transitionState: state => ({...state, transitioned: true}),
        getWidgetsIds: () => widgetsIds,
      };
      createInstantSearchManager.mockImplementation(() => ism);
      const createURL = jest.fn(state => state);

      const wrapper = mount(
        <InstantSearch
          {...DEFAULT_PROPS}
          state={{}}
          onStateChange={() => null}
          createURL={createURL}
        >
          <div />
        </InstantSearch>
      );

      const {ais: {createHrefForState}} = wrapper.instance().getChildContext();
      const outputURL = createHrefForState({a: 1});
      expect(outputURL).toEqual({a: 1, transitioned: true});
      expect(createURL.mock.calls[0][1]).toBe(widgetsIds);
    });

    it('returns # otherwise', () => {
      const wrapper = mount(
        <InstantSearch {...DEFAULT_PROPS}>
          <div />
        </InstantSearch>
      );

      const {ais: {createHrefForState}} = wrapper.instance().getChildContext();
      const outputURL = createHrefForState({a: 1});
      expect(outputURL).toBe('#');
    });
  });
});
