import React from 'react';
import { setAddon, storiesOf } from '@storybook/react';
import JSXAddon from 'storybook-addon-jsx';
import { Panel, SortBy } from 'react-instantsearch-dom';
import { displayName, filterProps, WrapWithHits } from './util';

setAddon(JSXAddon);

const stories = storiesOf('SortBy', module);

stories
  .addWithJSX(
    'default',
    () => (
      <WrapWithHits linkedStoryGroup="SortBy">
        <SortBy
          items={[
            { value: 'instant_search', label: 'Featured' },
            { value: 'instant_search_price_asc', label: 'Price asc.' },
            { value: 'instant_search_price_desc', label: 'Price desc.' },
          ]}
          defaultRefinement="instant_search"
        />
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'without label',
    () => (
      <WrapWithHits linkedStoryGroup="SortBy">
        <SortBy
          items={[
            { value: 'instant_search' },
            { value: 'instant_search_price_asc' },
            { value: 'instant_search_price_desc' },
          ]}
          defaultRefinement="instant_search"
        />
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'with Panel',
    () => (
      <WrapWithHits linkedStoryGroup="SortBy">
        <Panel header="Sort By" footer="Footer">
          <SortBy
            items={[
              { value: 'instant_search', label: 'Featured' },
              { value: 'instant_search_price_asc', label: 'Price asc.' },
              { value: 'instant_search_price_desc', label: 'Price desc.' },
            ]}
            defaultRefinement="instant_search"
          />
        </Panel>
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  );
