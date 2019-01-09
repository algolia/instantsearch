import React from 'react';
import { storiesOf } from '@storybook/react';
import { Panel, ToggleRefinement } from 'react-instantsearch-dom';
import { WrapWithHits } from './util';

const stories = storiesOf('ToggleRefinement', module);

stories
  .add('default', () => (
    <WrapWithHits linkedStoryGroup="ToggleRefinement">
      <ToggleRefinement
        attribute="free_shipping"
        label="Free shipping"
        value={true}
      />
    </WrapWithHits>
  ))
  .add('checked by default', () => (
    <WrapWithHits linkedStoryGroup="ToggleRefinement">
      <ToggleRefinement
        attribute="free_shipping"
        label="Free shipping"
        value={true}
        defaultRefinement={true}
      />
    </WrapWithHits>
  ))
  .add('with Panel', () => (
    <WrapWithHits linkedStoryGroup="ToggleRefinement">
      <Panel header="Toggle Refinement" footer="Footer">
        <ToggleRefinement
          attribute="free_shipping"
          label="Free shipping"
          value={true}
        />
      </Panel>
    </WrapWithHits>
  ));
