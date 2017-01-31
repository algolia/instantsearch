import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {StarRating, Panel, SearchBox} from '../packages/react-instantsearch/dom';
import {withKnobs, object, number} from '@kadira/storybook-addon-knobs';
import {WrapWithHits} from './util';

const stories = storiesOf('StarRating', module);

stories.addDecorator(withKnobs);

stories.add('default', () =>
  <WrapWithHits hasPlayground={true} linkedStoryGroup="StarRating">
    <StarRating attributeName="rating" max={6} min={1}/>
  </WrapWithHits>
).add('with panel', () =>
  <WrapWithHits>
      <Panel title="Ratings">
        <StarRating attributeName="rating" max={6} min={1}/>
      </Panel>
  </WrapWithHits>
).add('with panel but no refinement', () =>
  <WrapWithHits searchBox={false}>
      <Panel title="Ratings">
         <StarRating attributeName="rating" max={6} min={1}/>
         <div style={{display: 'none'}}>
            <SearchBox defaultRefinement="ds" />
         </div>
      </Panel>
  </WrapWithHits>
).add('playground', () =>
  <WrapWithHits >
    <StarRating
      attributeName="rating"
      max={number('max', 6)}
      translations={object('translate', {ratingLabel: ' & Up'})}
    />
  </WrapWithHits>
);
