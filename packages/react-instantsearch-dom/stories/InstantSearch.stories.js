import React from 'react';
import algoliasearch from 'algoliasearch';
import { setAddon, storiesOf } from '@storybook/react';
import JSXAddon from 'storybook-addon-jsx';
import {
  InstantSearch,
  SearchBox,
  Hits,
} from '../packages/react-instantsearch/dom';
import { displayName, filterProps } from './util';

setAddon(JSXAddon);

const stories = storiesOf('<InstantSearch>', module);

stories
  .addWithJSX(
    'default',
    () => (
      <InstantSearch
        appId="latency"
        apiKey="6be0576ff61c053d5f9a3225e2a90f76"
        indexName="ikea"
      >
        <SearchBox />
        <Hits />
      </InstantSearch>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'with custom root',
    () => (
      <InstantSearch
        appId="latency"
        apiKey="6be0576ff61c053d5f9a3225e2a90f76"
        indexName="ikea"
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
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'with algolia search client',
    () => (
      <InstantSearch
        indexName="ikea"
        searchClient={algoliasearch(
          'latency',
          '6be0576ff61c053d5f9a3225e2a90f76'
        )}
      >
        <SearchBox />
        <Hits />
      </InstantSearch>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'with custom search client',
    () => (
      <InstantSearch
        indexName="ikea"
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
    ),
    {
      displayName,
      filterProps,
    }
  );
