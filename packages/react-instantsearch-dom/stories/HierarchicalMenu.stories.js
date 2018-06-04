import React from 'react';
import { setAddon, storiesOf } from '@storybook/react';
import JSXAddon from 'storybook-addon-jsx';
import { text, boolean, number } from '@storybook/addon-knobs';
import { HierarchicalMenu, SearchBox, Panel } from 'react-instantsearch-dom';
import { displayName, filterProps, WrapWithHits } from './util';

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
    'playground',
    () => (
      <WrapWithHits linkedStoryGroup="HierarchicalMenu">
        <HierarchicalMenu
          attributes={['category', 'sub_category', 'sub_sub_category']}
          defaultRefinement={text('defaultSelectedItem', 'Bathroom')}
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
  )
  .addWithJSX(
    'with Panel',
    () => (
      <WrapWithHits hasPlayground={true} linkedStoryGroup="HierarchicalMenu">
        <Panel header="Hierarchical Menu" footer="Footer">
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
    'with Panel but no refinement',
    () => (
      <WrapWithHits
        searchBox={false}
        hasPlayground={true}
        linkedStoryGroup="HierarchicalMenu"
      >
        <Panel header="Hierarchical Menu" footer="Footer">
          <HierarchicalMenu
            attributes={['category', 'sub_category', 'sub_sub_category']}
          />
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
  );
