import React from 'react';
import { storiesOf } from '@kadira/storybook';
import {
  HierarchicalMenu,
  Panel,
  SearchBox,
} from '../packages/react-instantsearch/dom';
import {
  withKnobs,
  text,
  boolean,
  number,
} from '@kadira/storybook-addon-knobs';
import { WrapWithHits } from './util';

const stories = storiesOf('HierarchicalMenu', module);

stories.addDecorator(withKnobs);

stories
  .add('default', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="HierarchicalMenu">
      <HierarchicalMenu
        attributes={['category', 'sub_category', 'sub_sub_category']}
      />
    </WrapWithHits>
  ))
  .add('with default selected item', () => (
    <WrapWithHits>
      <HierarchicalMenu
        attributes={['category', 'sub_category', 'sub_sub_category']}
        defaultRefinement="Eating"
      />
    </WrapWithHits>
  ))
  .add('with show more', () => (
    <WrapWithHits>
      <HierarchicalMenu
        attributes={['category', 'sub_category', 'sub_sub_category']}
        limitMin={2}
        limitMax={5}
        showMore={true}
      />
    </WrapWithHits>
  ))
  .add('with panel', () => (
    <WrapWithHits>
      <Panel title="Category">
        <HierarchicalMenu
          attributes={['category', 'sub_category', 'sub_sub_category']}
        />
      </Panel>
    </WrapWithHits>
  ))
  .add('with panel but no refinement', () => (
    <WrapWithHits searchBox={false}>
      <Panel title="Category">
        <HierarchicalMenu
          attributes={['category', 'sub_category', 'sub_sub_category']}
        />
        <div style={{ display: 'none' }}>
          <SearchBox defaultRefinement="ds" />
        </div>
      </Panel>
    </WrapWithHits>
  ))
  .add('playground', () => (
    <WrapWithHits>
      <HierarchicalMenu
        attributes={['category', 'sub_category', 'sub_sub_category']}
        defaultRefinement={text('defaultSelectedItem', 'Bathroom')}
        limitMin={number('limitMin', 10)}
        limitMax={number('limitMax', 20)}
        showMore={boolean('showMore', true)}
      />
    </WrapWithHits>
  ));
