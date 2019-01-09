import React from 'react';
import { storiesOf } from '@storybook/react';
import {
  ClearRefinements,
  RefinementList,
  Panel,
} from 'react-instantsearch-dom';
import { WrapWithHits } from './util';

const stories = storiesOf('ClearRefinements', module);

stories
  .add('with refinements to clear', () => (
    <WrapWithHits linkedStoryGroup="ClearRefinements">
      <div>
        <ClearRefinements />
        <div style={{ display: 'none' }}>
          <RefinementList attribute="brand" defaultRefinement={['Apple']} />
        </div>
      </div>
    </WrapWithHits>
  ))
  .add('nothing to clear', () => (
    <WrapWithHits linkedStoryGroup="ClearRefinements">
      <ClearRefinements />
    </WrapWithHits>
  ))
  .add('clear all refinements and the query', () => (
    <WrapWithHits linkedStoryGroup="ClearRefinements">
      <ClearRefinements
        clearsQuery
        translations={{ reset: 'Clear refinements and query' }}
      />
      <RefinementList attribute="brand" defaultRefinement={['Apple']} />
    </WrapWithHits>
  ))
  .add('with Panel', () => (
    <WrapWithHits linkedStoryGroup="ClearRefinements">
      <Panel header="Clear refinements" footer="Footer">
        <ClearRefinements />
      </Panel>

      <div style={{ display: 'none' }}>
        <RefinementList attribute="brand" defaultRefinement={['Apple']} />
      </div>
    </WrapWithHits>
  ))
  .add('with Panel but no refinement', () => (
    <WrapWithHits linkedStoryGroup="ClearRefinements">
      <Panel header="Clear refinements" footer="Footer">
        <ClearRefinements />
      </Panel>
    </WrapWithHits>
  ));
