import React from 'react';
import { setAddon, storiesOf } from '@storybook/react';
import {
  HierarchicalMenu,
  Panel,
  SearchBox,
} from '../packages/react-instantsearch/dom';
import { text, boolean, number } from '@storybook/addon-knobs';
import { displayName, filterProps, WrapWithHits } from './util';
import JSXAddon from 'storybook-addon-jsx';

setAddon(JSXAddon);

const stories = storiesOf('HierarchicalMenu', module);

stories
  .addWithJSX(
    'default',
    () => (
      <WrapWithHits hasPlayground={true} linkedStoryGroup="HierarchicalMenu">
        <HierarchicalMenu
          attributes={['category', 'sub_category', 'sub_sub_category']}
        />
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
      <WrapWithHits hasPlayground={true} linkedStoryGroup="HierarchicalMenu">
        <HierarchicalMenu
          attributes={['category', 'sub_category', 'sub_sub_category']}
          defaultRefinement="Eating"
        />
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
      <WrapWithHits hasPlayground={true} linkedStoryGroup="HierarchicalMenu">
        <HierarchicalMenu
          attributes={['category', 'sub_category', 'sub_sub_category']}
          limitMin={2}
          limitMax={5}
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
    'with panel',
    () => (
      <WrapWithHits hasPlayground={true} linkedStoryGroup="HierarchicalMenu">
        <Panel title="Category">
          <HierarchicalMenu
            attributes={['category', 'sub_category', 'sub_sub_category']}
          />
        </Panel>
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'with panel but no refinement',
    () => (
      <WrapWithHits
        searchBox={false}
        hasPlayground={true}
        linkedStoryGroup="HierarchicalMenu"
      >
        <Panel title="Category">
          <HierarchicalMenu
            attributes={['category', 'sub_category', 'sub_sub_category']}
          />
          <div style={{ display: 'none' }}>
            <SearchBox defaultRefinement="ds" />
          </div>
        </Panel>
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
      <WrapWithHits linkedStoryGroup="HierarchicalMenu">
        <HierarchicalMenu
          attributes={['category', 'sub_category', 'sub_sub_category']}
          defaultRefinement={text('defaultSelectedItem', 'Bathroom')}
          limitMin={number('limitMin', 10)}
          limitMax={number('limitMax', 20)}
          showMore={boolean('showMore', true)}
        />
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  );
