import React from 'react';
import { storiesOf } from '@storybook/react';
import { Stats } from '../packages/react-instantsearch/dom';
import { withKnobs } from '@storybook/addon-knobs';
import { WrapWithHits } from './util';

const stories = storiesOf('Stats', module);

stories.addDecorator(withKnobs);

stories.add('default', () => (
  <WrapWithHits linkedStoryGroup="Stats">
    <div>
      <Stats />
    </div>
  </WrapWithHits>
));
