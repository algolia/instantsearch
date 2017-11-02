import React from 'react';
import { setAddon, storiesOf } from '@storybook/react';
import { ClearAll, RefinementList } from '../packages/react-instantsearch/dom';
import { withKnobs } from '@storybook/addon-knobs';
import { displayName, filterProps, WrapWithHits } from './util';
import JSXAddon from 'storybook-addon-jsx';

setAddon(JSXAddon);

const stories = storiesOf('ClearAll', module);

stories
  .addDecorator(withKnobs)
  .addWithJSX(
    'with refinements to clear',
    () => (
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
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'nothing to clear',
    () => (
      <WrapWithHits linkedStoryGroup="ClearAll">
        <ClearAll />
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
      <WrapWithHits linkedStoryGroup="ClearAll">
        <ClearAll
          clearsQuery
          translations={{ reset: 'Clear refinements and query' }}
        />
        <RefinementList
          attributeName="category"
          defaultRefinement={['Dining']}
        />
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  );
