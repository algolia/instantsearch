import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {RefinementList} from '../packages/react-instantsearch';
import {withKnobs, text, boolean, number} from '@kadira/storybook-addon-knobs';
import Wrapper from './util';

const stories = storiesOf('RefinementList', module);

stories.addDecorator(withKnobs);

stories.add('default', () =>
  <Wrapper>
    <RefinementList attributeName="colors"/>
  </Wrapper>
).add('with selected item', () =>
  <Wrapper >
    <RefinementList
      attributeName="colors"
      defaultSelectedItems={['Black']}
    />
  </Wrapper>
).add('with show more', () =>
  <Wrapper >
    <RefinementList
      attributeName="colors"
      limitMin={2}
      limitMax={5}
      showMore={true}
    />
  </Wrapper>
).add('sorted by name first', () =>
  <Wrapper >
    <RefinementList
      attributeName="colors"
      sortBy={['name:asc', 'count:desc']}
    />
  </Wrapper>
).add('playground', () =>
  <Wrapper >
    <RefinementList
      attributeName="colors"
      defaultSelectedItems={[text('defaultSelectedItems', 'Black'), 'White']}
      limitMin={number('limitMin', 10)}
      limitMax={number('limitMax', 20)}
      showMore={boolean('showMore', true)}
      sortBy={[text('sort by', 'name:asc')]}
    />
  </Wrapper>
);
