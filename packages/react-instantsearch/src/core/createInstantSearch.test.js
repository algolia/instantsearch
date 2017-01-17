/* eslint-env jest, jasmine */
/* eslint-disable no-console */
import React from 'react';
import {shallow} from 'enzyme';

import createInstantSearch from './createInstantSearch';
import InstantSearch from './InstantSearch.js';
import pkg from '../../package.json';

describe('createInstantSearch', () => {
  const algoliaClient = {addAlgoliaAgent: jest.fn()};
  const algoliaClientFactory = jest.fn(() => algoliaClient);
  const CustomInstantSearch = createInstantSearch(algoliaClientFactory, {Root: 'div'});

  beforeEach(() => {
    algoliaClient.addAlgoliaAgent.mockClear();
    algoliaClientFactory.mockClear();
  });

  it('wraps InstantSearch', () => {
    const wrapper = shallow(<CustomInstantSearch appId="app" apiKey="key" indexName="name"/>);
    expect(wrapper.is(InstantSearch)).toBe(true);
    expect(wrapper.props()).toMatchSnapshot();
    expect(wrapper.props().algoliaClient).toBe(algoliaClient);
  });

  it('creates an algolia client using the provided factory', () => {
    shallow(<CustomInstantSearch appId="app" apiKey="key" indexName="name"/>);
    expect(algoliaClientFactory).toHaveBeenCalledTimes(1);
    expect(algoliaClientFactory).toHaveBeenCalledWith('app', 'key');
    expect(algoliaClient.addAlgoliaAgent).toHaveBeenCalledTimes(1);
    expect(algoliaClient.addAlgoliaAgent).toHaveBeenCalledWith(`react-instantsearch ${pkg.version}`);
  });

  it('updates the algoliaClient when appId or apiKey changes', () => {
    const wrapper = shallow(<CustomInstantSearch appId="app" apiKey="key" indexName="name"/>);
    wrapper.setProps({appId: 'app2', apiKey: 'key'});
    wrapper.setProps({appId: 'app', apiKey: 'key2'});
    expect(algoliaClientFactory).toHaveBeenCalledTimes(3);
    expect(algoliaClientFactory.mock.calls[1]).toEqual(['app2', 'key']);
    expect(algoliaClientFactory.mock.calls[2]).toEqual(['app', 'key2']);
  });

  it('uses the provided algoliaClient', () => {
    const wrapper = shallow(<CustomInstantSearch algoliaClient={algoliaClient} indexName="name" />);
    expect(algoliaClientFactory).toHaveBeenCalledTimes(0);
    expect(algoliaClient.addAlgoliaAgent).toHaveBeenCalledTimes(1);
    expect(wrapper.props().algoliaClient).toBe(algoliaClient);
  });

  it('updates the algoliaClient when provided algoliaClient is passed down', () => {
    const wrapper = shallow(<CustomInstantSearch algoliaClient={algoliaClient} indexName="name" />);
    expect(algoliaClient.addAlgoliaAgent).toHaveBeenCalledTimes(1);
    const newAlgoliaClient = {addAlgoliaAgent: jest.fn()};
    wrapper.setProps({
      algoliaClient: newAlgoliaClient,
    });
    expect(wrapper.props().algoliaClient).toBe(newAlgoliaClient);
    expect(newAlgoliaClient.addAlgoliaAgent).toHaveBeenCalledTimes(1);
  });
});
