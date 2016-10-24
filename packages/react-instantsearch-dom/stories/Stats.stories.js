import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {Stats, RefinementList} from '../packages/react-instantsearch/dom';
import {withKnobs} from '@kadira/storybook-addon-knobs';
import {WrapWithHits} from './util';

const stories = storiesOf('Stats', module);

stories.addDecorator(withKnobs);

stories.add('default', () =>
  <WrapWithHits >
    <div>
      <Stats />
      <RefinementList
        attributeName="colors"
        defaultRefinement={['Black']}
        theme={{root: {display: 'none'}}}
      />
    </div>
  </WrapWithHits>
);
