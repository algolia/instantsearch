import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {HierarchicalMenu} from '../packages/react-instantsearch';
import {withKnobs, text, boolean, number} from '@kadira/storybook-addon-knobs';
import Wrapper from './util';

const stories = storiesOf('HierarchicalMenu', module);

stories.addDecorator(withKnobs);

stories.add('default', () =>
  <Wrapper >
    <HierarchicalMenu
      id="categories"
      attributes={[
        'category',
        'sub_category',
        'sub_sub_category',
      ]}
    />
  </Wrapper>
).add('with default selected item', () =>
  <Wrapper >
    <HierarchicalMenu
      id="categories"
      attributes={[
        'category',
        'sub_category',
        'sub_sub_category',
      ]}
      defaultSelectedItem="Eating"
    />
  </Wrapper>
).add('with show more', () =>
  <Wrapper >
    <HierarchicalMenu
      id="categories"
      attributes={[
        'category',
        'sub_category',
        'sub_sub_category',
      ]}
      limitMin={2}
      limitMax={5}
      showMore={true}
    />
  </Wrapper>
).add('with sort by', () =>
  <Wrapper >
    <HierarchicalMenu
      id="categories"
      attributes={[
        'category',
        'sub_category',
        'sub_sub_category',
      ]}
      sortBy={['count:desc']}
    />
  </Wrapper>
).add('playground', () =>
  <Wrapper >
    <HierarchicalMenu
      id="categories"
      attributes={[
        'category',
        'sub_category',
        'sub_sub_category',
      ]}
      defaultSelectedItem={text('defaultSelectedItem', 'Bathroom')}
      limitMin={number('limitMin', 10)}
      limitMax={number('limitMax', 20)}
      showMore={boolean('showMore', true)}
      sortBy={[text('sort by', 'name:asc')]}
    />
  </Wrapper>
);
