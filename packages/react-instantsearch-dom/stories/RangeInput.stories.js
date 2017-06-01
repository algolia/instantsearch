import React from 'react';
import { storiesOf } from '@storybook/react';
import {
  RangeInput,
  Panel,
  SearchBox,
} from '../packages/react-instantsearch/dom';
import { withKnobs, object, number } from '@storybook/addon-knobs';
import { WrapWithHits } from './util';

const stories = storiesOf('RangeInput', module);

stories.addDecorator(withKnobs);

stories
  .add('default', () => (
    <WrapWithHits linkedStoryGroup="RangeInput">
      <RangeInput attributeName="price" />
    </WrapWithHits>
  ))
  .add('playground', () => (
    <WrapWithHits linkedStoryGroup="RangeInput">
      <RangeInput
        attributeName="price"
        min={number('max', 0)}
        max={number('max', 300)}
        translations={object('translations', {
          submit: ' go',
          separator: 'to',
        })}
      />
    </WrapWithHits>
  ))
  .add('with panel', () => (
    <WrapWithHits linkedStoryGroup="RangeInput">
      <Panel title="Price">
        <RangeInput attributeName="price" />
      </Panel>
    </WrapWithHits>
  ))
  .add('with panel but no refinement', () => (
    <WrapWithHits searchBox={false} linkedStoryGroup="RangeInput">
      <Panel title="Price">
        <RangeInput attributeName="price" />
        <div style={{ display: 'none' }}>
          <SearchBox defaultRefinement="ds" />
        </div>
      </Panel>
    </WrapWithHits>
  ));
