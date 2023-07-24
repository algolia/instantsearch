import { storiesOf } from '@storybook/react';
import algoliasearch from 'algoliasearch/lite';
import React from 'react';
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch-dom';

import { Content } from './util';

const stories = storiesOf('<InstantSearch>', module);

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

stories
  .add('default', () => (
    <Content linkedStoryGroup="InstantSearch.stories.js">
      <InstantSearch searchClient={searchClient} indexName="instant_search">
        <SearchBox />
        <Hits />
      </InstantSearch>
    </Content>
  ))
  .add('with custom search client', () => (
    <Content linkedStoryGroup="InstantSearch.stories.js">
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
    </Content>
  ));
