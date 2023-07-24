import { text, boolean, number } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { HierarchicalMenu, SearchBox, Panel } from 'react-instantsearch-dom';

import { WrapWithHits } from './util';

const stories = storiesOf('HierarchicalMenu', module);

stories
  .add('default', () => (
    <WrapWithHits
      hasPlayground={true}
      linkedStoryGroup="HierarchicalMenu.stories.js"
    >
      <HierarchicalMenu
        attributes={[
          'hierarchicalCategories.lvl0',
          'hierarchicalCategories.lvl1',
          'hierarchicalCategories.lvl2',
        ]}
      />
    </WrapWithHits>
  ))
  .add('with default selected item', () => (
    <WrapWithHits
      hasPlayground={true}
      linkedStoryGroup="HierarchicalMenu.stories.js"
    >
      <HierarchicalMenu
        attributes={[
          'hierarchicalCategories.lvl0',
          'hierarchicalCategories.lvl1',
          'hierarchicalCategories.lvl2',
        ]}
        defaultRefinement="Cameras & Camcorders"
      />
    </WrapWithHits>
  ))
  .add('with show more', () => (
    <WrapWithHits
      hasPlayground={true}
      linkedStoryGroup="HierarchicalMenu.stories.js"
    >
      <HierarchicalMenu
        attributes={[
          'hierarchicalCategories.lvl0',
          'hierarchicalCategories.lvl1',
          'hierarchicalCategories.lvl2',
        ]}
        limit={2}
        showMoreLimit={5}
        showMore={true}
      />
    </WrapWithHits>
  ))
  .add('playground', () => (
    <WrapWithHits linkedStoryGroup="HierarchicalMenu.stories.js">
      <HierarchicalMenu
        attributes={[
          'hierarchicalCategories.lvl0',
          'hierarchicalCategories.lvl1',
          'hierarchicalCategories.lvl2',
        ]}
        defaultRefinement={text('defaultSelectedItem', 'Cameras & Camcorders')}
        limit={number('limit', 10)}
        showMoreLimit={number('showMoreLimit', 20)}
        showMore={boolean('showMore', true)}
      />
    </WrapWithHits>
  ))
  .add('with Panel', () => (
    <WrapWithHits
      hasPlayground={true}
      linkedStoryGroup="HierarchicalMenu.stories.js"
    >
      <Panel header="Hierarchical Menu" footer="Footer">
        <HierarchicalMenu
          attributes={[
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ]}
        />
      </Panel>
    </WrapWithHits>
  ))
  .add('with Panel but no refinement', () => (
    <WrapWithHits
      searchBox={false}
      hasPlayground={true}
      linkedStoryGroup="HierarchicalMenu.stories.js"
    >
      <Panel header="Hierarchical Menu" footer="Footer">
        <HierarchicalMenu
          attributes={[
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ]}
        />
      </Panel>

      <div style={{ display: 'none' }}>
        <SearchBox defaultRefinement="tutututututu" />
      </div>
    </WrapWithHits>
  ));
