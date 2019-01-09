import React from 'react';
import orderBy from 'lodash.orderby';
import { storiesOf } from '@storybook/react';
import { text, boolean, number } from '@storybook/addon-knobs';
import { Menu, Panel, SearchBox } from 'react-instantsearch-dom';
import { WrapWithHits } from './util';

const stories = storiesOf('Menu', module);

stories
  .add('default', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="Menu">
      <Menu attribute="brand" />
    </WrapWithHits>
  ))
  .add('with default selected item', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="Menu">
      <Menu attribute="brand" defaultRefinement="Apple" />
    </WrapWithHits>
  ))
  .add('with show more', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="Menu">
      <Menu attribute="brand" limit={2} showMoreLimit={5} showMore={true} />
    </WrapWithHits>
  ))
  .add('with search inside items', () => (
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
  ))
  .add('with the sort strategy changed', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="Menu">
      <Menu
        attribute="brand"
        transformItems={items =>
          orderBy(items, ['label', 'count'], ['asc', 'desc'])
        }
      />
    </WrapWithHits>
  ))
  .add('with Panel', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="Menu">
      <Panel header="Menu" footer="Footer">
        <Menu attribute="brand" />
      </Panel>
    </WrapWithHits>
  ))
  .add('with Panel but no refinement', () => (
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
  ))
  .add('playground', () => (
    <WrapWithHits linkedStoryGroup="Menu">
      <Menu
        attribute="brand"
        defaultRefinement={text('defaultSelectedItem', 'Apple')}
        limit={number('limit', 10)}
        showMoreLimit={number('showMoreLimit', 20)}
        showMore={boolean('showMore', true)}
      />
    </WrapWithHits>
  ));
