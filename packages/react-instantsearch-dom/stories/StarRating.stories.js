import React from 'react';
import { setAddon, storiesOf } from '@storybook/react';
import {
  StarRating,
  Panel,
  SearchBox,
  Configure,
} from '../packages/react-instantsearch/dom';
import { object, number } from '@storybook/addon-knobs';
import { displayName, filterProps, WrapWithHits } from './util';
import JSXAddon from 'storybook-addon-jsx';

setAddon(JSXAddon);

const stories = storiesOf('StarRating', module);

stories
  .addWithJSX(
    'default',
    () => (
      <WrapWithHits hasPlayground={true} linkedStoryGroup="StarRating">
        <StarRating attributeName="rating" />
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
      <WrapWithHits hasPlayground={true} linkedStoryGroup="StarRating">
        <StarRating attributeName="rating" min={3} />
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
      <WrapWithHits hasPlayground={true} linkedStoryGroup="StarRating">
        <StarRating attributeName="rating" max={3} />
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
      <WrapWithHits hasPlayground={true} linkedStoryGroup="StarRating">
        <StarRating attributeName="rating" min={2} max={4} />
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
      <WrapWithHits hasPlayground={true} linkedStoryGroup="StarRating">
        <Configure filters="rating>=4" />

        <StarRating attributeName="rating" />
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
      <WrapWithHits hasPlayground={true} linkedStoryGroup="StarRating">
        <Configure filters="rating>=4" />

        <StarRating attributeName="rating" min={1} max={5} />
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'with panel',
    () => (
      <WrapWithHits hasPlayground={true} linkedStoryGroup="StarRating">
        <Panel title="Ratings">
          <StarRating attributeName="rating" />
        </Panel>
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'with panel but no refinement',
    () => (
      <WrapWithHits
        searchBox={false}
        hasPlayground={true}
        linkedStoryGroup="StarRating"
      >
        <Panel title="Ratings">
          <StarRating attributeName="rating" />

          <div style={{ display: 'none' }}>
            <SearchBox defaultRefinement="ds" />
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
    'with panel but no refinement & min & max',
    () => (
      <WrapWithHits
        searchBox={false}
        hasPlayground={true}
        linkedStoryGroup="StarRating"
      >
        <Panel title="Ratings">
          <StarRating attributeName="rating" min={1} max={5} />

          <div style={{ display: 'none' }}>
            <SearchBox defaultRefinement="ds" />
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
      <WrapWithHits linkedStoryGroup="StarRating">
        <StarRating
          attributeName="rating"
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
