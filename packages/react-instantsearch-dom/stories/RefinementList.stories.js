import React from 'react';
import orderBy from 'lodash.orderby';
import { setAddon, storiesOf } from '@storybook/react';
import { boolean, number, array } from '@storybook/addon-knobs';
import JSXAddon from 'storybook-addon-jsx';
import { Panel, RefinementList, SearchBox } from 'react-instantsearch-dom';
import { displayName, filterProps, WrapWithHits } from './util';

setAddon(JSXAddon);

const stories = storiesOf('RefinementList', module);

stories
  .addWithJSX(
    'default',
    () => (
      <WrapWithHits linkedStoryGroup="RefinementList" hasPlayground={true}>
        <RefinementList attribute="brand" />
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'with selected item',
    () => (
      <WrapWithHits linkedStoryGroup="RefinementList" hasPlayground={true}>
        <RefinementList attribute="brand" defaultRefinement={['Apple']} />
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
      <WrapWithHits linkedStoryGroup="RefinementList" hasPlayground={true}>
        <RefinementList
          attribute="brand"
          limit={2}
          showMoreLimit={5}
          showMore={true}
        />
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
      <WrapWithHits linkedStoryGroup="RefinementList" hasPlayground={true}>
        <RefinementList attribute="brand" searchable />
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
      <WrapWithHits linkedStoryGroup="RefinementList" hasPlayground={true}>
        <RefinementList
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
      <WrapWithHits linkedStoryGroup="RefinementList" hasPlayground={true}>
        <Panel header="Refinement List" footer="Footer">
          <RefinementList attribute="brand" />
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
        linkedStoryGroup="RefinementList"
        hasPlayground={true}
      >
        <Panel header="Refinement List" footer="Footer">
          <RefinementList attribute="brand" />
        </Panel>

        <div style={{ display: 'none' }}>
          <SearchBox defaultRefinement="tutututututu" />
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
      <WrapWithHits linkedStoryGroup="RefinementList">
        <RefinementList
          attribute="brand"
          defaultRefinement={array('defaultSelectedItem', ['Apple', 'Samsung'])}
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
