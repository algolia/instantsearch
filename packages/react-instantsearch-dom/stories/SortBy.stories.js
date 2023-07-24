import { storiesOf } from '@storybook/react';
import React from 'react';
import { Panel, SortBy } from 'react-instantsearch-dom';

import { WrapWithHits } from './util';

const stories = storiesOf('SortBy', module);

stories
  .add('default', () => (
    <WrapWithHits linkedStoryGroup="SortBy.stories.js">
      <SortBy
        items={[
          { value: 'instant_search', label: 'Featured' },
          { value: 'instant_search_price_asc', label: 'Price asc.' },
          { value: 'instant_search_price_desc', label: 'Price desc.' },
        ]}
        defaultRefinement="instant_search"
      />
    </WrapWithHits>
  ))
  .add('without label', () => (
    <WrapWithHits linkedStoryGroup="SortBy.stories.js">
      <SortBy
        items={[
          { value: 'instant_search' },
          { value: 'instant_search_price_asc' },
          { value: 'instant_search_price_desc' },
        ]}
        defaultRefinement="instant_search"
      />
    </WrapWithHits>
  ))
  .add('with Panel', () => (
    <WrapWithHits linkedStoryGroup="SortBy.stories.js">
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
  ));
