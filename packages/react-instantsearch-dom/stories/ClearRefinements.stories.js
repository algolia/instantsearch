import React from 'react';
import { setAddon, storiesOf } from '@storybook/react';
import JSXAddon from 'storybook-addon-jsx';
import {
  ClearRefinements,
  RefinementList,
  Panel,
} from 'react-instantsearch-dom';
import { displayName, filterProps, WrapWithHits } from './util';

setAddon(JSXAddon);

const stories = storiesOf('ClearRefinements', module);

stories
  .addWithJSX(
    'with refinements to clear',
    () => (
      <WrapWithHits linkedStoryGroup="ClearRefinements">
        <div>
          <ClearRefinements />
          <div style={{ display: 'none' }}>
            <RefinementList attribute="brand" defaultRefinement={['Apple']} />
          </div>
        </div>
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'nothing to clear',
    () => (
      <WrapWithHits linkedStoryGroup="ClearRefinements">
        <ClearRefinements />
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'clear all refinements and the query',
    () => (
      <WrapWithHits linkedStoryGroup="ClearRefinements">
        <ClearRefinements
          clearsQuery
          translations={{ reset: 'Clear refinements and query' }}
        />
        <RefinementList attribute="brand" defaultRefinement={['Apple']} />
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
      <WrapWithHits linkedStoryGroup="ClearRefinements">
        <Panel header="Clear refinements" footer="Footer">
          <ClearRefinements />
        </Panel>

        <div style={{ display: 'none' }}>
          <RefinementList attribute="brand" defaultRefinement={['Apple']} />
        </div>
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
      <WrapWithHits linkedStoryGroup="ClearRefinements">
        <Panel header="Clear refinements" footer="Footer">
          <ClearRefinements />
        </Panel>
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  );
