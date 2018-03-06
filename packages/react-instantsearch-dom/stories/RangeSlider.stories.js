import React from 'react';
import { setAddon, storiesOf } from '@storybook/react';
import { object, number } from '@storybook/addon-knobs';
import { Panel } from '../packages/react-instantsearch/dom';
import { displayName, filterProps, WrapWithHits } from './util';
import Range from './3rdPartyIntegrations.stories';
import JSXAddon from 'storybook-addon-jsx';

setAddon(JSXAddon);

const stories = storiesOf('RangeSlider', module);

stories
  .addWithJSX(
    'default',
    () => (
      <WrapWithHits hasPlayground={true} linkedStoryGroup="RangeSlider">
        <Range attribute="price" />
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'providing default value',
    () => (
      <WrapWithHits hasPlayground={true} linkedStoryGroup="RangeSlider">
        <Range attribute="price" defaultRefinement={{ min: 50, max: 200 }} />
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'custom min/max bounds',
    () => (
      <WrapWithHits hasPlayground={true} linkedStoryGroup="RangeSlider">
        <Range attribute="price" min={30} max={100} />
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
      <WrapWithHits hasPlayground={true} linkedStoryGroup="RangeSlider">
        <Panel header="Range Slider" footer="Footer">
          <Range attribute="price" />
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
      <WrapWithHits linkedStoryGroup="RangeSlider">
        <Range
          attribute="price"
          defaultRefinement={object('default value', { min: 150, max: 200 })}
          min={number('min', 100)}
          max={number('max', 400)}
        />
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  );
