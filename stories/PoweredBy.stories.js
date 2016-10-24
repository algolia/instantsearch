import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {PoweredBy} from '../packages/react-instantsearch/dom';
import {Wrap} from './util';

const stories = storiesOf('PoweredBy', module);

stories.add('default', () =>
  <Wrap>
    <PoweredBy />
  </Wrap>
);
