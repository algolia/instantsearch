import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {CurrentRefinements, RefinementList} from '../packages/react-instantsearch/dom';
import {withKnobs} from '@kadira/storybook-addon-knobs';
import {WrapWithHits} from './util';

const stories = storiesOf('CurrentRefinements', module);

stories.addDecorator(withKnobs);

stories.add('default', () =>
  <WrapWithHits linkedStoryGroup="CurrentRefinements">
    <div>
      <CurrentRefinements />
      <RefinementList
        attributeName="colors"
        defaultRefinement={['Black']}
        theme={{root: {display: 'none'}}}
      /></div>
  </WrapWithHits>
);
