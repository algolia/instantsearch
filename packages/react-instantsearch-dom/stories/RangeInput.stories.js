import React from 'react';
import { storiesOf } from '@kadira/storybook';
import {
  RangeInput,
  Panel,
  SearchBox,
} from '../packages/react-instantsearch/dom';
import { withKnobs, object, number } from '@kadira/storybook-addon-knobs';
import { WrapWithHits } from './util';

const stories = storiesOf('RangeInput', module);

stories.addDecorator(withKnobs);

stories
  .add('default', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="RangeInput">
      <RangeInput attributeName="price" />
    </WrapWithHits>
  ))
  .add('playground', () => (
    <WrapWithHits>

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
    <WrapWithHits>
      <Panel title="Price">
        <RangeInput attributeName="price" />
      </Panel>
    </WrapWithHits>
  ))
  .add('with panel but no refinement', () => (
    <WrapWithHits searchBox={false}>
      <Panel title="Price">
        <RangeInput attributeName="price" />
        <div style={{ display: 'none' }}>
          <SearchBox defaultRefinement="ds" />
        </div>
      </Panel>
    </WrapWithHits>
  ));
