import React from 'react';
import { storiesOf } from '@storybook/react';
import { ScrollTo, Hits, Configure } from '../packages/react-instantsearch/dom';
import { withKnobs } from '@storybook/addon-knobs';
import { WrapWithHits } from './util';

const stories = storiesOf('ScrollTo', module);

stories.addDecorator(withKnobs);

stories.add('default', () =>
  <WrapWithHits linkedStoryGroup="ScrollTo">
    <Configure hitsPerPage={5} />
    <ScrollTo>
      <Hits />
    </ScrollTo>
  </WrapWithHits>
);
