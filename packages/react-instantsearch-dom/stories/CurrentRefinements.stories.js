import React from 'react';
import { setAddon, storiesOf } from '@storybook/react';
import {
  CurrentRefinements,
  Menu,
  NumericMenu,
  HierarchicalMenu,
  Panel,
  RangeInput,
  RefinementList,
  ToggleRefinement,
} from '../packages/react-instantsearch/dom';
import { displayName, filterProps, WrapWithHits } from './util';
import JSXAddon from 'storybook-addon-jsx';
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
          attribute="category"
          defaultRefinement={['Dining', 'Other']}
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
        <Menu attribute="category" defaultRefinement="Dining" />
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
    'with ToggleRefinement',
    () => (
      <WrapWithHits linkedStoryGroup="CurrentRefinements">
        <CurrentRefinements />
        <hr />
        <ToggleRefinement
          attribute="materials"
          label="Made with solid pine"
          value={'Solid pine'}
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
          <RefinementList attribute="category" defaultRefinement={['Dining']} />
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
