import React from 'react';
import orderBy from 'lodash.orderby';
import { setAddon, storiesOf } from '@storybook/react';
import { text, boolean, number } from '@storybook/addon-knobs';
import JSXAddon from 'storybook-addon-jsx';
import { Menu, Panel, SearchBox } from 'react-instantsearch-dom';
import { displayName, filterProps, WrapWithHits } from './util';

setAddon(JSXAddon);

const stories = storiesOf('Menu', module);

stories
  .addWithJSX(
    'default',
    () => (
      <WrapWithHits hasPlayground={true} linkedStoryGroup="Menu">
        <Menu attribute="brand" />
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'with default selected item',
    () => (
      <WrapWithHits hasPlayground={true} linkedStoryGroup="Menu">
        <Menu attribute="brand" defaultRefinement="Apple" />
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'with show more',
    () => (
      <WrapWithHits hasPlayground={true} linkedStoryGroup="Menu">
        <Menu attribute="brand" limit={2} showMoreLimit={5} showMore={true} />
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'with search inside items',
    () => (
      <WrapWithHits hasPlayground={true} linkedStoryGroup="Menu">
        <Menu
          attribute="brand"
          searchable
          transformItems={items =>
            orderBy(
              items,
              ['isRefined', 'count', 'label'],
              ['desc', 'desc', 'asc']
            )
          }
        />
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'with the sort strategy changed',
    () => (
      <WrapWithHits hasPlayground={true} linkedStoryGroup="Menu">
        <Menu
          attribute="brand"
          transformItems={items =>
            orderBy(items, ['label', 'count'], ['asc', 'desc'])
          }
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
      <WrapWithHits hasPlayground={true} linkedStoryGroup="Menu">
        <Panel header="Menu" footer="Footer">
          <Menu attribute="brand" />
        </Panel>
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'with Panel but no refinement',
    () => (
      <WrapWithHits
        searchBox={false}
        hasPlayground={true}
        linkedStoryGroup="Menu"
      >
        <Panel header="Menu" footer="Footer">
          <Menu attribute="brand" />
        </Panel>

        <div style={{ display: 'none' }}>
          <SearchBox defaultRefinement="dkjsakdjskajdksjakdjaskj" />
        </div>
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'playground',
    () => (
      <WrapWithHits linkedStoryGroup="Menu">
        <Menu
          attribute="brand"
          defaultRefinement={text('defaultSelectedItem', 'Apple')}
          limit={number('limit', 10)}
          showMoreLimit={number('showMoreLimit', 20)}
          showMore={boolean('showMore', true)}
        />
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  );
