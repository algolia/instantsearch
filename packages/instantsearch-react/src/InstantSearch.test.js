/* eslint-env jest, jasmine */

import React from 'react';
import {mount} from 'enzyme';

import {AlgoliaSearchHelper} from 'algoliasearch-helper';
jest.unmock('algoliasearch-helper');
jest.unmock('algoliasearch');
jest.unmock('debug');

import InstantSearch from './InstantSearch';
jest.unmock('history');

jest.unmock('./InstantSearch');
jest.unmock('./createConfigManager');
jest.unmock('./createStateManager');

describe('InstantSearch', () => {
  it('correctly instantiates the API client and helper', () => {
    const wrapper = mount(
      <InstantSearch appId="foo" apiKey="bar" indexName="foobar">
        <div />
      </InstantSearch>
    );
    const {helper} = wrapper.instance();
    expect(helper.getState().index).toBe('foobar');
    expect(helper.client.applicationID).toBe('foo');
    expect(helper.client.apiKey).toBe('bar');
  });

  it('exposes a configManager', () => {

  });
});
