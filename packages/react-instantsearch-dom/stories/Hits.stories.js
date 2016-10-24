import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {Hits} from '../packages/react-instantsearch/dom';
import {withKnobs} from '@kadira/storybook-addon-knobs';
import {WrapWithHits} from './util';

const stories = storiesOf('Hits', module);

stories.addDecorator(withKnobs);

stories.add('default', () =>
  <WrapWithHits >
    <Hits />
  </WrapWithHits>
).add('with max hits per page', () =>
  <WrapWithHits >
    <Hits defaultRefinement={5}/>
  </WrapWithHits>
);
