/* eslint-env jest, jasmine */
/* eslint-disable max-len */

import React from 'react';
import {mount} from 'enzyme';
import {createHistory} from 'history';

import InstantSearch from './InstantSearch';
jest.unmock('./InstantSearch');
jest.unmock('debug');
import createHistoryStateManager from './createHistoryStateManager';
jest.mock('./createHistoryStateManager', () => jest.fn(() => ({
  getStateFromCurrentLocation: jest.fn(),
})));
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
    createHistoryStateManager.mockClear();
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
        <InstantSearch
          {...DEFAULT_PROPS}
          state={{}}
        >
          <div />
        </InstantSearch>
      );
    }).toThrowError('You must provide `onStateChange`, `createURL` props alongside the `state` prop on <InstantSearch>');

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
    }).toThrowError('You must provide a `onStateChange` prop alongside the `state`, `createURL` props on <InstantSearch>');

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
    }).toThrowError('You must provide a `state` prop alongside the `onStateChange`, `createURL` props on <InstantSearch>');


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

  it('works as a history controlled input', () => {
    const widgetsIds = [];
    const ism = {
      transitionState: state => ({...state, transitioned: true}),
      onExternalStateUpdate: jest.fn(),
      getWidgetsIds: () => widgetsIds,
    };
    createInstantSearchManager.mockImplementation(() => ism);
    const initialState = {a: 0};
    const hsm = {
      getStateFromCurrentLocation: jest.fn(() => initialState),
      onExternalStateUpdate: jest.fn(),
      createHrefForState: jest.fn(state => state),
    };
    createHistoryStateManager.mockImplementation(() => hsm);

    const history = {};
    const threshold = 666;
    const wrapper = mount(
      <InstantSearch {...DEFAULT_PROPS} history={history} threshold={threshold}>
        <div />
      </InstantSearch>
    );
    const nextState = {a: 1};

    const args = createHistoryStateManager.mock.calls[0][0];
    expect(args.history).toBe(history);
    expect(args.threshold).toBe(threshold);
    expect(args.getKnownKeys()).toBe(widgetsIds);
    args.onInternalStateUpdate(nextState);
    expect(ism.onExternalStateUpdate.mock.calls[0][0]).toBe(nextState);

    const {ais: {onInternalStateUpdate}} = wrapper.instance().getChildContext();
    onInternalStateUpdate(nextState);
    expect(hsm.onExternalStateUpdate.mock.calls[0][0]).toEqual({
      a: 1,
      transitioned: true,
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
  });

  it('creates its own history if urlSync=true and history=undefined', () => {
    const history = {};
    createHistory.mockImplementationOnce(() => history);
    mount(
      <InstantSearch {...DEFAULT_PROPS} urlSync={true}>
        <div />
      </InstantSearch>
    );

    const args = createHistoryStateManager.mock.calls[0][0];
    expect(args.history).toBe(history);
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

    it('passes through to the hsManager when it is defined', () => {
      const widgetsIds = [];
      const ism = {
        transitionState: state => ({...state, transitioned: true}),
        getWidgetsIds: () => widgetsIds,
      };
      createInstantSearchManager.mockImplementation(() => ism);
      const initialState = {a: 0};
      const hsm = {
        getStateFromCurrentLocation: jest.fn(() => initialState),
        onExternalStateUpdate: jest.fn(),
        createHrefForState: jest.fn(state => state),
      };
      createHistoryStateManager.mockImplementation(() => hsm);

      const wrapper = mount(
        <InstantSearch
          {...DEFAULT_PROPS}
          urlSync
        >
          <div />
        </InstantSearch>
      );

      const {ais: {createHrefForState}} = wrapper.instance().getChildContext();
      const outputURL = createHrefForState({a: 1});
      expect(outputURL).toEqual({a: 1, transitioned: true});
      expect(hsm.createHrefForState.mock.calls[0][1]).toBe(widgetsIds);
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

  it('cleans after itself when it unmounts', () => {
    const hsm = {
      getStateFromCurrentLocation: jest.fn(() => ({})),
      unlisten: jest.fn(),
    };
    createHistoryStateManager.mockImplementation(() => hsm);

    const wrapper = mount(
      <InstantSearch
        {...DEFAULT_PROPS}
        urlSync
      >
        <div />
      </InstantSearch>
    );
    wrapper.unmount();
    expect(hsm.unlisten.mock.calls.length).toBe(1);
  });
});
