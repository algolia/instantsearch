import { object, number } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import React from 'react';
import {
  Configure,
  Panel,
  RatingMenu,
  SearchBox,
} from 'react-instantsearch-dom';

import { WrapWithHits } from './util';

const stories = storiesOf('RatingMenu', module);

stories
  .add('default', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="RatingMenu.stories.js">
      <RatingMenu attribute="rating" />
    </WrapWithHits>
  ))
  .add('with min', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="RatingMenu.stories.js">
      <RatingMenu attribute="rating" min={3} />
    </WrapWithHits>
  ))
  .add('with max', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="RatingMenu.stories.js">
      <RatingMenu attribute="rating" max={3} />
    </WrapWithHits>
  ))
  .add('with min & max', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="RatingMenu.stories.js">
      <RatingMenu attribute="rating" min={2} max={4} />
    </WrapWithHits>
  ))
  .add('with only one value available', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="RatingMenu.stories.js">
      <Configure filters="rating>=4" />

      <RatingMenu attribute="rating" />
    </WrapWithHits>
  ))
  .add('with only one value available & min & max', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="RatingMenu.stories.js">
      <Configure filters="rating>=4" />

      <RatingMenu attribute="rating" min={1} max={5} />
    </WrapWithHits>
  ))
  .add('with Panel', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="RatingMenu.stories.js">
      <Panel header="Ratings">
        <RatingMenu attribute="rating" />
      </Panel>
    </WrapWithHits>
  ))
  .add('with Panel but no refinement', () => (
    <WrapWithHits
      searchBox={false}
      hasPlayground={true}
      linkedStoryGroup="RatingMenu.stories.js"
    >
      <Panel header="Ratings">
        <RatingMenu attribute="rating" />

        <div style={{ display: 'none' }}>
          <SearchBox defaultRefinement="tututututututu" />
        </div>
      </Panel>
    </WrapWithHits>
  ))
  .add('with Panel but no refinement & min & max', () => (
    <WrapWithHits
      searchBox={false}
      hasPlayground={true}
      linkedStoryGroup="RatingMenu.stories.js"
    >
      <Panel header="Ratings">
        <RatingMenu attribute="rating" min={1} max={5} />

        <div style={{ display: 'none' }}>
          <SearchBox defaultRefinement="tutututututu" />
        </div>
      </Panel>
    </WrapWithHits>
  ))
  .add('playground', () => (
    <WrapWithHits linkedStoryGroup="RatingMenu.stories.js">
      <RatingMenu
        attribute="rating"
        min={number('min', 1)}
        max={number('max', 5)}
        translations={object('translations', { ratingLabel: ' & Up' })}
      />
    </WrapWithHits>
  ));
