import React from 'react';
import { storiesOf } from '@storybook/react';
import { Toggle } from '../packages/react-instantsearch/dom';
import { withKnobs } from '@storybook/addon-knobs';
import { WrapWithHits } from './util';

const stories = storiesOf('Toggle', module);

stories.addDecorator(withKnobs);

stories
  .add('default', () =>
    <WrapWithHits linkedStoryGroup="Toggle">
      <Toggle
        attributeName="materials"
        label="Made with solid pine"
        value={'Solid pine'}
      />
    </WrapWithHits>
  )
  .add('checked by default', () =>
    <WrapWithHits linkedStoryGroup="Toggle">
      <Toggle
        attributeName="materials"
        label="Made with solid pine"
        value={'Solid pine'}
        defaultRefinement={true}
      />
    </WrapWithHits>
  );
