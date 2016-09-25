import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {CurrentFilters, RefinementList} from '../packages/react-instantsearch';
import {withKnobs} from '@kadira/storybook-addon-knobs';
import Wrapper from './util';

const stories = storiesOf('CurrentFilters', module);

stories.addDecorator(withKnobs);

stories.add('default', () =>
  <Wrapper >
    <div>
      <CurrentFilters />
      <RefinementList
        attributeName="colors"
        defaultSelectedItems={['Black']}
        theme={{root: {display: 'none'}}}
      /></div>
  </Wrapper>
).add('only filters', () =>
  <Wrapper >
    <div>
      <CurrentFilters
        theme={{clearAll: {display: 'none'}} }
      />
      <RefinementList
        attributeName="colors"
        defaultSelectedItems={['Black']}
        theme={{root: {display: 'none'}}}
      /></div>
  </Wrapper>
).add('only clear all button', () =>
  <Wrapper >
    <div>
      <CurrentFilters
        theme={{filters: {display: 'none'}} }
      />
      <RefinementList
        attributeName="colors"
        defaultSelectedItems={['Black']}
        theme={{root: {display: 'none'}}}
      /></div>
  </Wrapper>
);
