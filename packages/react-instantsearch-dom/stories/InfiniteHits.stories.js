import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {InfiniteHits} from '../packages/react-instantsearch/dom';
import {withKnobs} from '@kadira/storybook-addon-knobs';
import {WrapWithHits} from './util';

const stories = storiesOf('InfiniteHits', module);

stories.addDecorator(withKnobs);

stories.add('default', () =>
  <WrapWithHits linkedStoryGroup="Hits" pagination={false}>
    <InfiniteHits />
  </WrapWithHits>
);
