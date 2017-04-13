import React from 'react';
import { storiesOf } from '@kadira/storybook';
import { ClearAll, RefinementList } from '../packages/react-instantsearch/dom';
import { withKnobs } from '@kadira/storybook-addon-knobs';
import { WrapWithHits } from './util';

const stories = storiesOf('ClearAll', module);

stories.addDecorator(withKnobs);

stories
  .add('with refinements to clear', () => (
    <WrapWithHits linkedStoryGroup="ClearAll">
      <div>
        <ClearAll />
        <div style={{ display: 'none' }}>
          <RefinementList
            attributeName="category"
            defaultRefinement={['Dining']}
          />
        </div>
      </div>
    </WrapWithHits>
  ))
  .add('nothing to clear', () => (
    <WrapWithHits linkedStoryGroup="ClearAll">
      <ClearAll />
    </WrapWithHits>
  ))
  .add('clear all refinements and the query', () => (
    <WrapWithHits linkedStoryGroup="ClearAll">
      <ClearAll
        clearsQuery
        translations={{ reset: 'Clear refinements and query' }}
      />
      <RefinementList attributeName="category" defaultRefinement={['Dining']} />
    </WrapWithHits>
  ));
