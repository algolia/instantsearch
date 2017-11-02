import React from 'react';
import { setAddon, storiesOf } from '@storybook/react';
import {
  StarRating,
  Panel,
  SearchBox,
  Configure,
} from '../packages/react-instantsearch/dom';
import { withKnobs, object, number } from '@storybook/addon-knobs';
import { displayName, filterProps, WrapWithHits } from './util';
import JSXAddon from 'storybook-addon-jsx';

setAddon(JSXAddon);

const stories = storiesOf('StarRating', module);

stories
  .addDecorator(withKnobs)
  .addWithJSX(
    'default',
    () => (
      <WrapWithHits hasPlayground={true} linkedStoryGroup="StarRating">
        <StarRating attributeName="rating" max={6} min={1} />
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
          <StarRating attributeName="rating" max={6} min={1} />
        </Panel>
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'with some unavailable refinements',
    () => (
      <WrapWithHits hasPlayground={true} linkedStoryGroup="StarRating">
        <Configure filters="rating>=4" />
        <Panel title="Ratings">
          <StarRating attributeName="rating" max={6} min={1} />
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
          <StarRating attributeName="rating" max={6} min={1} />
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
    'with filter on rating',
    () => (
      <WrapWithHits hasPlayground={true} linkedStoryGroup="StarRating">
        <Configure filters="rating>2" />
        <StarRating attributeName="rating" max={6} min={1} />
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
          max={number('max', 6)}
          translations={object('translations', { ratingLabel: ' & Up' })}
        />
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  );
