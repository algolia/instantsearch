import React from 'react';
import { storiesOf } from '@storybook/react';
import { PoweredBy } from 'react-instantsearch-dom';
import { WrapWithHits } from './util';

const stories = storiesOf('PoweredBy', module);

stories.add('default', () => (
  <WrapWithHits linkedStoryGroup="PoweredBy">
    <PoweredBy />
  </WrapWithHits>
));
