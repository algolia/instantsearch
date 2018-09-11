import React from 'react';
import { setAddon, storiesOf } from '@storybook/react';
import JSXAddon from 'storybook-addon-jsx';
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
import { displayName, filterProps, WrapWithHits } from './util';

setAddon(JSXAddon);

const stories = storiesOf('CurrentRefinements', module);

stories
  .addWithJSX(
    'with RefinementList',
    () => (
      <WrapWithHits linkedStoryGroup="CurrentRefinements">
        <CurrentRefinements />
        <hr />
        <RefinementList
          attribute="brand"
          defaultRefinement={['Apple', 'Samsung']}
        />
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'with Menu',
    () => (
      <WrapWithHits linkedStoryGroup="CurrentRefinements">
        <CurrentRefinements />
        <hr />
        <Menu attribute="brand" defaultRefinement="Apple" />
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'with HierarchicalMenu',
    () => (
      <WrapWithHits linkedStoryGroup="CurrentRefinements">
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
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'with ToggleRefinement',
    () => (
      <WrapWithHits linkedStoryGroup="CurrentRefinements">
        <CurrentRefinements />
        <hr />
        <ToggleRefinement
          attribute="free_shipping"
          label="Free Shipping"
          value={true}
        />
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'with NumericMenu',
    () => (
      <WrapWithHits linkedStoryGroup="CurrentRefinements">
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
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'with RangeInput',
    () => (
      <WrapWithHits linkedStoryGroup="CurrentRefinements">
        <CurrentRefinements />
        <hr />
        <RangeInput
          attribute="price"
          defaultRefinement={{ min: 30, max: 500 }}
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
      <WrapWithHits linkedStoryGroup="CurrentRefinements">
        <Panel header="Current refinements" footer="Footer">
          <CurrentRefinements />
        </Panel>

        <div style={{ display: 'none' }}>
          <RefinementList attribute="brand" defaultRefinement={['Apple']} />
        </div>
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'with Panel but no refinements',
    () => (
      <WrapWithHits linkedStoryGroup="CurrentRefinements">
        <Panel header="Current refinements" footer="Footer">
          <CurrentRefinements />
        </Panel>
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  );
