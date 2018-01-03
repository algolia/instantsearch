import React from 'react';
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
              background: 'linear-gradient(80deg, #00D8FF, #00A7FF)',
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
  );
