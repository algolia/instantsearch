import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {Menu} from '../packages/react-instantsearch';
import {withKnobs, text, boolean, number} from '@kadira/storybook-addon-knobs';
import Wrapper from './util';

const stories = storiesOf('Menu', module);

stories.addDecorator(withKnobs);

stories.add('default', () =>
  <Wrapper >
    <Menu
      attributeName="category"
    />
  </Wrapper>
).add('with default selected item', () =>
  <Wrapper >
    <Menu
      attributeName="category"
      defaultSelectedItem="Eating"
    />
  </Wrapper>
).add('with show more', () =>
  <Wrapper >
    <Menu
      attributeName="category"
      limitMin={2}
      limitMax={5}
      showMore={true}
    />
  </Wrapper>
).add('with sort by', () =>
  <Wrapper >
    <Menu
      attributeName="category"
      sortBy={['name:desc']}
    />
  </Wrapper>
).add('playground', () =>
  <Wrapper >
    <Menu
      attributeName="category"
      defaultSelectedItem={text('defaultSelectedItem', 'Bathroom')}
      limitMin={number('limitMin', 10)}
      limitMax={number('limitMax', 20)}
      showMore={boolean('showMore', true)}
      sortBy={[text('sort by', 'name:asc')]}
    />
  </Wrapper>
);
