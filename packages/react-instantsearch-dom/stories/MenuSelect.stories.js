import React from 'react';
import orderBy from 'lodash.orderby';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';
import { MenuSelect, Panel, SearchBox } from 'react-instantsearch-dom';
import { WrapWithHits } from './util';

const stories = storiesOf('MenuSelect', module);

stories
  .add('default', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="MenuSelect">
      <MenuSelect attribute="brand" />
    </WrapWithHits>
  ))
  .add('with default selected item', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="MenuSelect">
      <MenuSelect attribute="brand" defaultRefinement="Apple" />
    </WrapWithHits>
  ))
  .add('with the sort strategy changed', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="MenuSelect">
      <MenuSelect
        attribute="brand"
        transformItems={items =>
          orderBy(items, ['label', 'count'], ['asc', 'desc'])
        }
      />
    </WrapWithHits>
  ))
  .add('playground', () => (
    <WrapWithHits linkedStoryGroup="MenuSelect">
      <MenuSelect
        attribute="brand"
        defaultRefinement={text('defaultSelectedItem', 'Apple')}
      />
    </WrapWithHits>
  ))
  .add('with localized count', () => (
    <WrapWithHits linkedStoryGroup="MenuSelect">
      <MenuSelect
        attribute="brand"
        defaultRefinement={text('defaultSelectedItem', 'Apple')}
        transformItems={items =>
          items.map(({ count, ...item }) => ({
            ...item,
            count: (count + 1000).toLocaleString(),
          }))
        }
      />
    </WrapWithHits>
  ))
  .add('with Panel', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="MenuSelect">
      <Panel header="Menu select" footer="Footer">
        <MenuSelect attribute="brand" />
      </Panel>
    </WrapWithHits>
  ))
  .add('with Panel but no refinement', () => (
    <WrapWithHits
      searchBox={false}
      hasPlayground={true}
      linkedStoryGroup="MenuSelect"
    >
      <Panel header="Menu select" footer="Footer">
        <MenuSelect attribute="brand" />
      </Panel>

      <div style={{ display: 'none' }}>
        <SearchBox defaultRefinement="dkjsakdjskajdksjakdjaskj" />
      </div>
    </WrapWithHits>
  ));
