import React from 'react';
import { storiesOf } from '@kadira/storybook';
import {
  StarRating,
  Panel,
  SearchBox,
  Configure,
} from '../packages/react-instantsearch/dom';
import { withKnobs, object, number } from '@kadira/storybook-addon-knobs';
import { WrapWithHits } from './util';

const stories = storiesOf('StarRating', module);

stories.addDecorator(withKnobs);

stories
  .add('default', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="StarRating">
      <StarRating attributeName="rating" max={6} min={1} />
    </WrapWithHits>
  ))
  .add('with panel', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="StarRating">
      <Panel title="Ratings">
        <StarRating attributeName="rating" max={6} min={1} />
      </Panel>
    </WrapWithHits>
  ))
  .add('with some unavailable refinements', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="StarRating">
      <Configure filters="rating>=4" />
      <Panel title="Ratings">
        <StarRating attributeName="rating" max={6} min={1} />
      </Panel>
    </WrapWithHits>
  ))
  .add('with panel but no refinement', () => (
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
  ))
  .add('with filter on rating', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="StarRating">
      <Configure filters="rating>2" />
      <StarRating attributeName="rating" max={6} min={1} />
    </WrapWithHits>
  ))
  .add('playground', () => (
    <WrapWithHits linkedStoryGroup="StarRating">
      <StarRating
        attributeName="rating"
        max={number('max', 6)}
        translations={object('translations', { ratingLabel: ' & Up' })}
      />
    </WrapWithHits>
  ));
