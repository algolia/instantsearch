import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {CurrentFilters, RefinementList} from '../packages/react-instantsearch/dom';
import {withKnobs} from '@kadira/storybook-addon-knobs';
import {Wrap} from './util';

const stories = storiesOf('CurrentFilters', module);

stories.addDecorator(withKnobs);

stories.add('default', () =>
  <Wrap >
    <div>
      <CurrentFilters />
      <RefinementList
        attributeName="colors"
        defaultRefinement={['Black']}
        theme={{root: {display: 'none'}}}
      /></div>
  </Wrap>
).add('only filters', () =>
  <Wrap >
    <div>
      <CurrentFilters
        theme={{clearAll: {display: 'none'}} }
      />
      <RefinementList
        attributeName="colors"
        defaultRefinement={['Black']}
        theme={{root: {display: 'none'}}}
      /></div>
  </Wrap>
).add('only clear all button', () =>
  <Wrap >
    <div>
      <CurrentFilters
        theme={{filters: {display: 'none'}} }
      />
      <RefinementList
        attributeName="colors"
        defaultRefinement={['Black']}
        theme={{root: {display: 'none'}}}
      /></div>
  </Wrap>
);
