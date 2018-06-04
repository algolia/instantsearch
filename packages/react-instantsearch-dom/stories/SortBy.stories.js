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
            { value: 'ikea', label: 'Featured' },
            { value: 'ikea_price_asc', label: 'Price asc.' },
            { value: 'ikea_price_desc', label: 'Price desc.' },
          ]}
          defaultRefinement="ikea"
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
            { value: 'ikea' },
            { value: 'ikea_price_asc' },
            { value: 'ikea_price_desc' },
          ]}
          defaultRefinement="ikea"
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
              { value: 'ikea', label: 'Featured' },
              { value: 'ikea_price_asc', label: 'Price asc.' },
              { value: 'ikea_price_desc', label: 'Price desc.' },
            ]}
            defaultRefinement="ikea"
          />
        </Panel>
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  );
