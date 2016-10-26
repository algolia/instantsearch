import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {RangeInput} from '../packages/react-instantsearch/dom';
import {withKnobs, object, number} from '@kadira/storybook-addon-knobs';
import {WrapWithHits} from './util';

const stories = storiesOf('RangeInput', module);

stories.addDecorator(withKnobs);

stories.add('default', () =>
  <WrapWithHits linkedStoryGroup="RangeInput">
    <RangeInput attributeName="price"/>
  </WrapWithHits>
).add('playground', () =>
  <WrapWithHits >

    <RangeInput attributeName="price"
                  min={number('max', 0)}
                  max={number('max', 300)}
                  translations={object('translate', {submit: ' go', separator: 'to'})}
    />
  </WrapWithHits>
);
