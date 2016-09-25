import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {Range} from '../packages/react-instantsearch';
import {withKnobs, object, number} from '@kadira/storybook-addon-knobs';
import Wrapper from './util';

const stories = storiesOf('RangeInput', module);

stories.addDecorator(withKnobs);

stories.add('default', () =>
  <Wrapper >
    <Range.Input attributeName="price"/>
  </Wrapper>
).add('playground', () =>
  <Wrapper >

    <Range.Input attributeName="rating"
                  min={number('max', 0)}
                  max={number('max', 300)}
                  translations={object('translate', {submit: ' go', separator: 'to'})}
    />
  </Wrapper>
);
