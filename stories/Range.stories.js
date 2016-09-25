import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {Range} from '../packages/react-instantsearch';
import {withKnobs, object, number} from '@kadira/storybook-addon-knobs';
import Wrapper from './util';

const stories = storiesOf('Range', module);

stories.addDecorator(withKnobs);

stories.add('default', () =>
  <Wrapper >

    <Range attributeName="price"/>
  </Wrapper>
).add('providing default value', () =>
  <Wrapper >

    <Range attributeName="price"
           defaultValue={{min: 50, max: 200}}
    />
  </Wrapper>
).add('custom min/max bounds', () =>
  <Wrapper >

    <Range attributeName="price"
           min={30}
           max={100}
    />
  </Wrapper>
).add('playground', () =>
  <Wrapper >

    <Range attributeName="price"
           defaultValue={object('default value', {min: 150, max: 200})}
           min={number('min', 100)}
           max={number('max', 400)}
    />
  </Wrapper>
);
