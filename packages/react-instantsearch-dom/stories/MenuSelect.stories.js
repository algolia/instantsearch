import { orderBy } from 'lodash';
import React from 'react';
import { setAddon, storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';
import JSXAddon from 'storybook-addon-jsx';
import { MenuSelect, Panel, SearchBox } from 'react-instantsearch-dom';
import { displayName, filterProps, WrapWithHits } from './util';

setAddon(JSXAddon);

const stories = storiesOf('MenuSelect', module);

stories
  .addWithJSX(
    'default',
    () => (
      <WrapWithHits hasPlayground={true} linkedStoryGroup="MenuSelect">
        <MenuSelect attribute="category" />
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
      <WrapWithHits hasPlayground={true} linkedStoryGroup="MenuSelect">
        <MenuSelect attribute="category" defaultRefinement="Eating" />
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
      <WrapWithHits hasPlayground={true} linkedStoryGroup="MenuSelect">
        <MenuSelect
          attribute="category"
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
    'playground',
    () => (
      <WrapWithHits linkedStoryGroup="MenuSelect">
        <MenuSelect
          attribute="category"
          defaultRefinement={text('defaultSelectedItem', 'Bathroom')}
        />
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'with localized count',
    () => (
      <WrapWithHits linkedStoryGroup="MenuSelect">
        <MenuSelect
          attribute="category"
          defaultRefinement={text('defaultSelectedItem', 'Bathroom')}
          transformItems={items =>
            items.map(({ count, ...item }) => ({
              ...item,
              count: (count + 1000).toLocaleString(),
            }))
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
      <WrapWithHits hasPlayground={true} linkedStoryGroup="MenuSelect">
        <Panel header="Menu select" footer="Footer">
          <MenuSelect attribute="category" />
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
        linkedStoryGroup="MenuSelect"
      >
        <Panel header="Menu select" footer="Footer">
          <MenuSelect attribute="category" />
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
  );
