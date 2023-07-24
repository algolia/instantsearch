import { object, number } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { Panel, RangeInput, SearchBox } from 'react-instantsearch-dom';

import { WrapWithHits } from './util';

const stories = storiesOf('RangeInput', module);

stories
  .add('default', () => (
    <WrapWithHits linkedStoryGroup="RangeInput.stories.js">
      <RangeInput attribute="price" />
    </WrapWithHits>
  ))
  .add('visible without refinement', () => (
    <WrapWithHits searchBox={false} linkedStoryGroup="RangeInput.stories.js">
      <RangeInput attribute="price" header="Range Input" />

      <div style={{ display: 'none' }}>
        <SearchBox defaultRefinement="ds" />
      </div>
    </WrapWithHits>
  ))
  .add('with no refinement', () => (
    <WrapWithHits searchBox={false} linkedStoryGroup="RangeInput.stories.js">
      <RangeInput attribute="price" />
      <div style={{ display: 'none' }}>
        <SearchBox defaultRefinement="ds" />
      </div>
    </WrapWithHits>
  ))
  .add('with precision of 2', () => (
    <WrapWithHits linkedStoryGroup="RangeInput.stories.js">
      <RangeInput attribute="price" precision={2} />
    </WrapWithHits>
  ))
  .add('with default value', () => (
    <WrapWithHits linkedStoryGroup="RangeInput.stories.js">
      <RangeInput attribute="price" defaultRefinement={{ min: 50 }} />
    </WrapWithHits>
  ))
  .add('with default values', () => (
    <WrapWithHits linkedStoryGroup="RangeInput.stories.js">
      <RangeInput attribute="price" defaultRefinement={{ min: 50, max: 200 }} />
    </WrapWithHits>
  ))
  .add('with min boundaries', () => (
    <WrapWithHits linkedStoryGroup="RangeInput.stories.js">
      <RangeInput attribute="price" min={30} />
    </WrapWithHits>
  ))
  .add('with max boundaries', () => (
    <WrapWithHits linkedStoryGroup="RangeInput.stories.js">
      <RangeInput attribute="price" max={500} />
    </WrapWithHits>
  ))
  .add('with min / max boundaries', () => (
    <WrapWithHits linkedStoryGroup="RangeInput.stories.js">
      <RangeInput attribute="price" min={30} max={500} />
    </WrapWithHits>
  ))
  .add('with boundaries and default value', () => (
    <WrapWithHits linkedStoryGroup="RangeInput.stories.js">
      <RangeInput
        attribute="price"
        min={30}
        max={500}
        defaultRefinement={{ min: 50, max: 200 }}
      />
    </WrapWithHits>
  ))
  .add('playground', () => (
    <WrapWithHits linkedStoryGroup="RangeInput.stories.js">
      <RangeInput
        attribute="price"
        min={number('min', 0)}
        max={number('max', 500)}
        precision={number('precision', 0)}
        defaultRefinement={object('default value', { min: 100, max: 400 })}
        translations={object('translations', {
          submit: ' go',
          separator: 'to',
        })}
      />
    </WrapWithHits>
  ))
  .add('with Panel', () => (
    <WrapWithHits linkedStoryGroup="RangeInput.stories.js">
      <Panel header="Range Input" footer="Footer">
        <RangeInput attribute="price" />
      </Panel>
    </WrapWithHits>
  ))
  .add('with Panel but no refinement', () => (
    <WrapWithHits searchBox={false} linkedStoryGroup="RangeInput.stories.js">
      <Panel header="Range Input" footer="Footer">
        <RangeInput attribute="price" />
      </Panel>

      <div style={{ display: 'none' }}>
        <SearchBox defaultRefinement="ds" />
      </div>
    </WrapWithHits>
  ));
