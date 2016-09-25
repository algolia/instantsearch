import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {Hits} from '../packages/react-instantsearch';
import {withKnobs} from '@kadira/storybook-addon-knobs';
import Wrapper from './util';

const stories = storiesOf('Hits', module);

stories.addDecorator(withKnobs);

stories.add('default', () =>
  <Wrapper >
    <Hits />
  </Wrapper>
).add('with max hits per page', () =>
  <Wrapper >
    <Hits hitsPerPage={5}/>
  </Wrapper>
);
