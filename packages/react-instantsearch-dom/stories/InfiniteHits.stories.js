import React from 'react';
import { storiesOf } from '@storybook/react';
import { InfiniteHits } from '../packages/react-instantsearch/dom';
import { withKnobs } from '@storybook/addon-knobs';
import { WrapWithHits } from './util';

const stories = storiesOf('InfiniteHits', module);

stories.addDecorator(withKnobs);

stories.add('default', () =>
  <WrapWithHits linkedStoryGroup="Hits" pagination={false}>
    <InfiniteHits />
  </WrapWithHits>
);
