import React from 'react';
import algoliasearch from 'algoliasearch';
import { storiesOf } from '@storybook/react';
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch-dom';

const stories = storiesOf('<InstantSearch>', module);

stories
  .add('default', () => (
    <InstantSearch
      appId="latency"
      apiKey="6be0576ff61c053d5f9a3225e2a90f76"
      indexName="instant_search"
    >
      <SearchBox />
      <Hits />
    </InstantSearch>
  ))
  .add('with custom root', () => (
    <InstantSearch
      appId="latency"
      apiKey="6be0576ff61c053d5f9a3225e2a90f76"
      indexName="instant_search"
      root={{
        Root: 'div',
        props: {
          style: {
            border: '1px solid red',
          },
        },
      }}
    >
      <SearchBox />
      <Hits />
    </InstantSearch>
  ))
  .add('with algolia search client', () => (
    <InstantSearch
      indexName="instant_search"
      searchClient={algoliasearch(
        'latency',
        '6be0576ff61c053d5f9a3225e2a90f76'
      )}
    >
      <SearchBox />
      <Hits />
    </InstantSearch>
  ))
  .add('with custom search client', () => (
    <InstantSearch
      indexName="instant_search"
      searchClient={{
        search() {
          return Promise.resolve({
            results: [{ hits: [{ name: 'Fake result' }] }],
          });
        },
      }}
    >
      <SearchBox />
      <Hits />
    </InstantSearch>
  ));
