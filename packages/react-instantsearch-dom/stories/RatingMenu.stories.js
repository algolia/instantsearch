import React from 'react';
import { setAddon, storiesOf } from '@storybook/react';
import { object, number } from '@storybook/addon-knobs';
import JSXAddon from 'storybook-addon-jsx';
import {
  Configure,
  Panel,
  RatingMenu,
  SearchBox,
} from 'react-instantsearch-dom';
import { displayName, filterProps, WrapWithHits } from './util';

setAddon(JSXAddon);

const stories = storiesOf('RatingMenu', module);

stories
  .addWithJSX(
    'default',
    () => (
      <WrapWithHits hasPlayground={true} linkedStoryGroup="RatingMenu">
        <RatingMenu attribute="rating" />
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'with min',
    () => (
      <WrapWithHits hasPlayground={true} linkedStoryGroup="RatingMenu">
        <RatingMenu attribute="rating" min={3} />
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'with max',
    () => (
      <WrapWithHits hasPlayground={true} linkedStoryGroup="RatingMenu">
        <RatingMenu attribute="rating" max={3} />
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'with min & max',
    () => (
      <WrapWithHits hasPlayground={true} linkedStoryGroup="RatingMenu">
        <RatingMenu attribute="rating" min={2} max={4} />
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'with only one value available',
    () => (
      <WrapWithHits hasPlayground={true} linkedStoryGroup="RatingMenu">
        <Configure filters="rating>=4" />

        <RatingMenu attribute="rating" />
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'with only one value available & min & max',
    () => (
      <WrapWithHits hasPlayground={true} linkedStoryGroup="RatingMenu">
        <Configure filters="rating>=4" />

        <RatingMenu attribute="rating" min={1} max={5} />
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
      <WrapWithHits hasPlayground={true} linkedStoryGroup="RatingMenu">
        <Panel header="Ratings">
          <RatingMenu attribute="rating" />
        </Panel>
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'with Panel but no refinement',
    () => (
      <WrapWithHits
        searchBox={false}
        hasPlayground={true}
        linkedStoryGroup="RatingMenu"
      >
        <Panel header="Ratings">
          <RatingMenu attribute="rating" />

          <div style={{ display: 'none' }}>
            <SearchBox defaultRefinement="tututututututu" />
          </div>
        </Panel>
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'with Panel but no refinement & min & max',
    () => (
      <WrapWithHits
        searchBox={false}
        hasPlayground={true}
        linkedStoryGroup="RatingMenu"
      >
        <Panel header="Ratings">
          <RatingMenu attribute="rating" min={1} max={5} />

          <div style={{ display: 'none' }}>
            <SearchBox defaultRefinement="tutututututu" />
          </div>
        </Panel>
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'playground',
    () => (
      <WrapWithHits linkedStoryGroup="RatingMenu">
        <RatingMenu
          attribute="rating"
          min={number('min', 1)}
          max={number('max', 5)}
          translations={object('translations', { ratingLabel: ' & Up' })}
        />
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  );
