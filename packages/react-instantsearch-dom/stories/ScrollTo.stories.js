import { storiesOf } from '@storybook/react';
import React from 'react';
import { ScrollTo, Hits, Configure } from 'react-instantsearch-dom';

import { WrapWithHits } from './util';

const stories = storiesOf('ScrollTo', module);

stories.add('default', () => (
  <WrapWithHits linkedStoryGroup="ScrollTo.stories.js">
    <Configure hitsPerPage={5} />
    <ScrollTo>
      <Hits />
    </ScrollTo>
  </WrapWithHits>
));
