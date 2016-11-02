import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {PoweredBy} from '../packages/react-instantsearch/dom';
import {WrapWithHits} from './util';

const stories = storiesOf('PoweredBy', module);

stories.add('default', () =>
  <WrapWithHits linkedStoryGroup="PoweredBy">
    <PoweredBy />
  </WrapWithHits>
);
