import React from 'react';
import { storiesOf } from '@kadira/storybook';
import {
  CurrentRefinements,
  RefinementList,
  Toggle,
  Panel,
} from '../packages/react-instantsearch/dom';
import { withKnobs } from '@kadira/storybook-addon-knobs';
import { WrapWithHits } from './util';

const stories = storiesOf('CurrentRefinements', module);

stories.addDecorator(withKnobs);

stories
  .add('default', () => (
    <WrapWithHits linkedStoryGroup="CurrentRefinements">
      <div>
        <CurrentRefinements />
        <div style={{ display: 'none' }}>
          <RefinementList
            attributeName="category"
            defaultRefinement={['Dining']}
          />
        </div>
      </div>
    </WrapWithHits>
  ))
  .add('with toggle', () => (
    <WrapWithHits linkedStoryGroup="CurrentRefinements">
      <div>
        <CurrentRefinements />
        <Toggle
          attributeName="materials"
          label="Made with solid pine"
          value={'Solid pine'}
        />
      </div>
    </WrapWithHits>
  ))
  .add('with panel', () => (
    <WrapWithHits linkedStoryGroup="CurrentRefinements">
      <Panel title="Current Refinements">
        <CurrentRefinements />
        <div style={{ display: 'none' }}>
          <RefinementList
            attributeName="category"
            defaultRefinement={['Dining']}
          />
        </div>
      </Panel>
    </WrapWithHits>
  ))
  .add('with panel but no refinement', () => (
    <WrapWithHits linkedStoryGroup="CurrentRefinements">
      <Panel title="Current Refinements">
        <CurrentRefinements />
      </Panel>
    </WrapWithHits>
  ));
