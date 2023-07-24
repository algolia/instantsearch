import { storiesOf } from '@storybook/react';
import React from 'react';
import { PoweredBy } from 'react-instantsearch-dom';

import { WrapWithHits } from './util';

const stories = storiesOf('PoweredBy', module);

stories.add('default', () => (
  <WrapWithHits linkedStoryGroup="PoweredBy.stories.js">
    <PoweredBy />
  </WrapWithHits>
));
