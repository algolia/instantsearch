import React from 'react';
import { setAddon, storiesOf } from '@storybook/react';
import {
  Panel,
  RefinementList,
  SearchBox,
} from '../packages/react-instantsearch/dom';
import { boolean, number, array } from '@storybook/addon-knobs';
import { displayName, filterProps, WrapWithHits } from './util';
import { orderBy } from 'lodash';
import JSXAddon from 'storybook-addon-jsx';

setAddon(JSXAddon);

const stories = storiesOf('RefinementList', module);

stories
  .addWithJSX(
    'default',
    () => (
      <WrapWithHits linkedStoryGroup="RefinementList" hasPlayground={true}>
        <RefinementList attribute="category" />
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
        <RefinementList attribute="category" defaultRefinement={['Dining']} />
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
          attribute="category"
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
        <RefinementList attribute="category" searchable />
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
    'with Panel',
    () => (
      <WrapWithHits linkedStoryGroup="RefinementList" hasPlayground={true}>
        <Panel header="Refinement List" footer="Footer">
          <RefinementList attribute="category" />
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
          <RefinementList attribute="category" />
        </Panel>

        <div style={{ display: 'none' }}>
          <SearchBox defaultRefinement="ds" />
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
          attribute="category"
          defaultRefinement={array('defaultSelectedItem', [
            'Decoration',
            'Lighting',
          ])}
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
