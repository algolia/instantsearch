import React from 'react';
import { storiesOf } from '@storybook/react';
import { object, number } from '@storybook/addon-knobs';
import { Panel } from 'react-instantsearch-dom';
import Range from './3rdPartyIntegrations.stories';
import { WrapWithHits } from './util';

const stories = storiesOf('RangeSlider', module);

const Warning = () => (
  <h3 style={{ marginBottom: 50, textAlign: 'center' }}>
    ⚠️ This example only works with the version 2.x of Rheostat ️️⚠️
  </h3>
);

stories
  .add('default', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="RangeSlider">
      <Warning />
      <Range attribute="price" />
    </WrapWithHits>
  ))
  .add('providing default value', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="RangeSlider">
      <Warning />
      <Range attribute="price" defaultRefinement={{ min: 50, max: 200 }} />
    </WrapWithHits>
  ))
  .add('custom min/max bounds', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="RangeSlider">
      <Warning />
      <Range attribute="price" min={30} max={100} />
    </WrapWithHits>
  ))
  .add('with Panel', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="RangeSlider">
      <Warning />
      <Panel header="Range Slider" footer="Footer">
        <Range attribute="price" />
      </Panel>
    </WrapWithHits>
  ))
  .add('playground', () => (
    <WrapWithHits linkedStoryGroup="RangeSlider">
      <Warning />
      <Range
        attribute="price"
        defaultRefinement={object('default value', { min: 150, max: 200 })}
        min={number('min', 100)}
        max={number('max', 400)}
      />
    </WrapWithHits>
  ));
