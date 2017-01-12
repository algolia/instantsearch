/* eslint-env jest, jasmine */
/* eslint-disable no-console */
import React from 'react';
import {mount} from 'enzyme';

import algoliaClient from 'algoliasearch';

import createInstantSearch from './createInstantSearch';

describe('createInstantSearch', () => {
  it('Instanciate the client when no algoliaClient provided', () => {
    const apiKey = '332335235235325';
    const appId = 'myApp';

    const algoliaClientFactory = jest.fn(algoliaClient);
    const InstantSearch = createInstantSearch(
      algoliaClientFactory, {
        Root: 'div',
        props: {className: 'ais-InstantSearch__root'},
      });

    const wrapper = mount(<InstantSearch appId={apiKey} apiKey={appId} indexName=""/>);

    const otherApiKey = '50943204984230498';
    const otherAppId = 'otherApp';
    wrapper.setProps({
      apiKey: otherApiKey,
      appId: otherAppId,
    });

    wrapper.setProps({
      apiKey: otherApiKey,
      appId: otherAppId,
    });

    expect(algoliaClientFactory).toHaveBeenCalledTimes(2);
  });

  it('Never call the client factory when algoliaClient is provided', () => {
    const algoliaClientFactory = jest.fn(algoliaClient);
    const InstantSearch = createInstantSearch(
      algoliaClientFactory, {
        Root: 'div',
        props: {className: 'ais-InstantSearch__root'},
      });

    const fakeClient = {
      addAlgoliaAgent: () => {},
      search: () => {},
    };

    const wrapper = mount(<InstantSearch algoliaClient={fakeClient} indexName=""/>);

    wrapper.setProps({
      algoliaClient: {
        search: () => {},
      },
    });

    expect(algoliaClientFactory).toHaveBeenCalledTimes(0);
  });

  it('Can switch from provided to non-provided algoliaClient, and instanciate accordingly', () => {
    const apiKey = '332335235235325';
    const appId = 'myApp';

    const algoliaClientFactory = jest.fn(algoliaClient);
    const InstantSearch = createInstantSearch(
      algoliaClientFactory, {
        Root: 'div',
        props: {className: 'ais-InstantSearch__root'},
      });

    const wrapper = mount(<InstantSearch appId={apiKey} apiKey={appId} indexName=""/>);

    const otherApiKey = '50943204984230498';
    const otherAppId = 'otherApp';
    wrapper.setProps({
      apiKey: otherApiKey,
      appId: otherAppId,
    });

    wrapper.setProps({
      algoliaClient: {
        search: () => {},
        addAlgoliaAgent: () => {},
      },
      apiKey: undefined,
      appId: undefined,
    });

    wrapper.setProps({
      algoliaClient: undefined,
      apiKey: otherApiKey,
      appId: otherAppId,
    });

    expect(algoliaClientFactory).toHaveBeenCalledTimes(3);
  });
});
