import { storiesOf } from '@storybook/react';
import React from 'react';
import {
  CurrentRefinements,
  Menu,
  NumericMenu,
  HierarchicalMenu,
  Panel,
  RangeInput,
  RefinementList,
  ToggleRefinement,
} from 'react-instantsearch-dom';

import { WrapWithHits } from './util';

const stories = storiesOf('CurrentRefinements', module);

stories
  .add('with RefinementList', () => (
    <WrapWithHits linkedStoryGroup="CurrentRefinements.stories.js">
      <CurrentRefinements />
      <hr />
      <RefinementList
        attribute="brand"
        defaultRefinement={['Apple', 'Samsung']}
      />
    </WrapWithHits>
  ))
  .add('with Menu', () => (
    <WrapWithHits linkedStoryGroup="CurrentRefinements.stories.js">
      <CurrentRefinements />
      <hr />
      <Menu attribute="brand" defaultRefinement="Apple" />
    </WrapWithHits>
  ))
  .add('with HierarchicalMenu', () => (
    <WrapWithHits linkedStoryGroup="CurrentRefinements.stories.js">
      <CurrentRefinements />
      <hr />
      <HierarchicalMenu
        attributes={[
          'hierarchicalCategories.lvl0',
          'hierarchicalCategories.lvl1',
          'hierarchicalCategories.lvl2',
        ]}
        defaultRefinement="Cameras & Camcorders > Digital Cameras"
      />
    </WrapWithHits>
  ))
  .add('with ToggleRefinement', () => (
    <WrapWithHits linkedStoryGroup="CurrentRefinements.stories.js">
      <CurrentRefinements />
      <hr />
      <ToggleRefinement
        attribute="free_shipping"
        label="Free Shipping"
        value={true}
      />
    </WrapWithHits>
  ))
  .add('with NumericMenu', () => (
    <WrapWithHits linkedStoryGroup="CurrentRefinements.stories.js">
      <CurrentRefinements />
      <hr />
      <NumericMenu
        attribute="price"
        items={[
          { end: 10, label: '<$10' },
          { start: 10, end: 100, label: '$10-$100' },
          { start: 100, end: 500, label: '$100-$500' },
          { start: 500, label: '>$500' },
        ]}
        defaultRefinement=":10"
      />
    </WrapWithHits>
  ))
  .add('with RangeInput', () => (
    <WrapWithHits linkedStoryGroup="CurrentRefinements.stories.js">
      <CurrentRefinements />
      <hr />
      <RangeInput attribute="price" defaultRefinement={{ min: 30, max: 500 }} />
    </WrapWithHits>
  ))
  .add('with Panel', () => (
    <WrapWithHits linkedStoryGroup="CurrentRefinements.stories.js">
      <Panel header="Current refinements" footer="Footer">
        <CurrentRefinements />
      </Panel>

      <div style={{ display: 'none' }}>
        <RefinementList attribute="brand" defaultRefinement={['Apple']} />
      </div>
    </WrapWithHits>
  ))
  .add('with Panel but no refinements', () => (
    <WrapWithHits linkedStoryGroup="CurrentRefinements.stories.js">
      <Panel header="Current refinements" footer="Footer">
        <CurrentRefinements />
      </Panel>
    </WrapWithHits>
  ));
