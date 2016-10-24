import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {Toggle} from '../packages/react-instantsearch/dom';
import {withKnobs} from '@kadira/storybook-addon-knobs';
import {WrapWithHits} from './util';

const stories = storiesOf('Toggle', module);

stories.addDecorator(withKnobs);

stories.add('default', () =>
  <WrapWithHits>
    <Toggle attributeName="materials"
            label="Made with solid pine"
            value={'Solid pine'}
    />
  </WrapWithHits>
);
