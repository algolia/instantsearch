import React from 'react';
import { storiesOf } from '@kadira/storybook';
import { Menu, Panel, SearchBox } from '../packages/react-instantsearch/dom';
import {
  withKnobs,
  text,
  boolean,
  number,
} from '@kadira/storybook-addon-knobs';
import { WrapWithHits } from './util';
import { orderBy } from 'lodash';

const stories = storiesOf('Menu', module);

stories.addDecorator(withKnobs);

stories
  .add('default', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="Menu">
      <Menu attributeName="category" />
    </WrapWithHits>
  ))
  .add('with default selected item', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="Menu">
      <Menu attributeName="category" defaultRefinement="Eating" />
    </WrapWithHits>
  ))
  .add('with show more', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="Menu">
      <Menu
        attributeName="category"
        limitMin={2}
        limitMax={5}
        showMore={true}
      />
    </WrapWithHits>
  ))
  .add('with search inside items', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="Menu">
      <Menu
        attributeName="category"
        withSearchBox
        transformItems={items =>
          orderBy(
            items,
            ['isRefined', 'count', 'label'],
            ['desc', 'desc', 'asc']
          )}
      />
    </WrapWithHits>
  ))
  .add('with the sort strategy changed', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="Menu">
      <Menu
        attributeName="category"
        transformItems={items =>
          orderBy(items, ['label', 'count'], ['asc', 'desc'])}
      />
    </WrapWithHits>
  ))
  .add('with panel', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="Menu">
      <Panel title="Category">
        <Menu attributeName="category" />
      </Panel>
    </WrapWithHits>
  ))
  .add('with panel but no available refinement', () => (
    <WrapWithHits
      searchBox={false}
      hasPlayground={true}
      linkedStoryGroup="Menu"
    >
      <Panel title="Category">
        <Menu attributeName="category" />
        <div style={{ display: 'none' }}>
          <SearchBox defaultRefinement="dkjsakdjskajdksjakdjaskj" />
        </div>
      </Panel>
    </WrapWithHits>
  ))
  .add('playground', () => (
    <WrapWithHits linkedStoryGroup="Menu">
      <Menu
        attributeName="category"
        defaultRefinement={text('defaultSelectedItem', 'Bathroom')}
        limitMin={number('limitMin', 10)}
        limitMax={number('limitMax', 20)}
        showMore={boolean('showMore', true)}
      />
    </WrapWithHits>
  ));
