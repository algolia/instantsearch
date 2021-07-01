import React from 'react';
import { storiesOf } from '@storybook/react';
import {
  ExperimentalDynamicWidgets,
  HierarchicalMenu,
  Menu,
  Panel,
  RefinementList,
} from 'react-instantsearch-dom';
import { WrapWithHits } from './util';

const stories = storiesOf('DynamicWidgets', module);

stories.add('default', () => (
  <WrapWithHits
    initialSearchState={{ refinementList: { brand: ['Apple'] } }}
    hasPlayground={true}
    linkedStoryGroup="DynamicWidgets.stories.js"
  >
    <ExperimentalDynamicWidgets
      transformItems={(_attributes, { results }) => {
        if (results._state.query === 'dog') {
          return ['categories'];
        }
        if (results._state.query === 'lego') {
          return ['categories', 'brand'];
        }
        return ['brand', 'hierarchicalCategories.lvl0', 'categories'];
      }}
    >
      <HierarchicalMenu
        attributes={[
          'hierarchicalCategories.lvl0',
          'hierarchicalCategories.lvl1',
          'hierarchicalCategories.lvl2',
          'hierarchicalCategories.lvl3',
        ]}
      />
      <Panel>
        <RefinementList attribute="brand" />
      </Panel>
      <Menu attribute="categories" />
    </ExperimentalDynamicWidgets>
  </WrapWithHits>
));
