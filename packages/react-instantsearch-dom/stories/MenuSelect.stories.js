import React from 'react';
import { orderBy } from 'lodash';
import { storiesOf } from '@storybook/react';
import { withKnobs, text } from '@storybook/addon-knobs';

import { WrapWithHits } from './util';
import {
  MenuSelect,
  Panel,
  SearchBox,
} from '../packages/react-instantsearch/dom';

const stories = storiesOf('MenuSelect', module);

stories.addDecorator(withKnobs);

stories
  .add('default', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="MenuSelect">
      <MenuSelect attributeName="category" />
    </WrapWithHits>
  ))
  .add('with default selected item', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="MenuSelect">
      <MenuSelect attributeName="category" defaultRefinement="Eating" />
    </WrapWithHits>
  ))
  .add('with the sort strategy changed', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="MenuSelect">
      <MenuSelect
        attributeName="category"
        transformItems={items =>
          orderBy(items, ['label', 'count'], ['asc', 'desc'])}
      />
    </WrapWithHits>
  ))
  .add('with panel', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="MenuSelect">
      <Panel title="Category">
        <MenuSelect attributeName="category" />
      </Panel>
    </WrapWithHits>
  ))
  .add('with panel but no available refinement', () => (
    <WrapWithHits
      searchBox={false}
      hasPlayground={true}
      linkedStoryGroup="MenuSelect"
    >
      <Panel title="Category">
        <MenuSelect attributeName="category" />
        <div style={{ display: 'none' }}>
          <SearchBox defaultRefinement="dkjsakdjskajdksjakdjaskj" />
        </div>
      </Panel>
    </WrapWithHits>
  ))
  .add('playground', () => (
    <WrapWithHits linkedStoryGroup="MenuSelect">
      <MenuSelect
        attributeName="category"
        defaultRefinement={text('defaultSelectedItem', 'Bathroom')}
      />
    </WrapWithHits>
  ));
