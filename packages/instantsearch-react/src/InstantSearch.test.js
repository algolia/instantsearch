/* eslint-env jest, jasmine */

import React from 'react';
import {mount} from 'enzyme';

import {AlgoliaSearchHelper} from 'algoliasearch-helper';
jest.unmock('algoliasearch-helper');
jest.unmock('algoliasearch');
jest.unmock('debug');
jest.unmock('algoliasearch-helper-provider/src/Provider');

import InstantSearch from './InstantSearch';
import config from './config';
jest.unmock('./InstantSearch');
jest.unmock('./createConfigManager');
jest.unmock('./config');

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

  it('correctly applies config', () => {
    const search = AlgoliaSearchHelper.prototype.search = jest.fn();
    const Configured = config(() => ({hitsPerPage: 666}))(() => null);
    mount(
      <InstantSearch appId="foo" apiKey="bar" indexName="foobar">
        <Configured />
      </InstantSearch>
    );
    expect(search.mock.calls.length).toBe(1);
    expect(search.mock.instances[0].getState().hitsPerPage).toBe(666);
  });
});
