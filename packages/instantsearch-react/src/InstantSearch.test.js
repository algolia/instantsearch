/* eslint-env jest, jasmine */
/* eslint-disable max-len */

import React from 'react';
import {mount} from 'enzyme';

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
});
