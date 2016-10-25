import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {ScrollTo, Hits} from '../packages/react-instantsearch/dom';
import {withKnobs} from '@kadira/storybook-addon-knobs';
import {WrapWithHits} from './util';

const stories = storiesOf('ScrollTo', module);

stories.addDecorator(withKnobs);

stories.add('default', () =>
  <WrapWithHits >
    <ScrollTo >
      <Hits hitsPerPage={5}/>
    </ScrollTo>
  </WrapWithHits>
);
