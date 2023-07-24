import { storiesOf } from '@storybook/react';
import React from 'react';
import {
  DynamicWidgets,
  HierarchicalMenu,
  Menu,
  Panel,
  RefinementList,
} from 'react-instantsearch-dom';

import { WrapWithHits } from './util';

const stories = storiesOf('DynamicWidgets', module);

stories
  .add('default', () => (
    <WrapWithHits
      hasPlayground={true}
      linkedStoryGroup="DynamicWidgets.stories.js"
    >
      <p>
        try the queries: <q>dog</q> or <q>lego</q>.
      </p>
      <DynamicWidgets fallbackWidget={RefinementList}>
        <HierarchicalMenu
          attributes={[
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
            'hierarchicalCategories.lvl3',
          ]}
        />
        <Panel header="Brand">
          <RefinementList attribute="brand" />
        </Panel>
        <Menu attribute="categories" />
      </DynamicWidgets>
    </WrapWithHits>
  ))
  .add('multiple requests', () => (
    <WrapWithHits
      initialSearchState={{ refinementList: { brand: ['Apple'] } }}
      hasPlayground={true}
      linkedStoryGroup="DynamicWidgets.stories.js"
    >
      <p>
        try the queries: <q>dog</q> or <q>lego</q>. Notice how there are two
        network requests, with a minimal payload each.
      </p>
      <DynamicWidgets fallbackWidget={RefinementList} facets={[]}>
        <HierarchicalMenu
          attributes={[
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
            'hierarchicalCategories.lvl3',
          ]}
        />
        <Panel header="Brand">
          <RefinementList attribute="brand" />
        </Panel>
        <Menu attribute="categories" />
      </DynamicWidgets>
    </WrapWithHits>
  ));
