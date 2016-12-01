import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {Stats, RefinementList} from '../packages/react-instantsearch/dom';
import {withKnobs} from '@kadira/storybook-addon-knobs';
import {WrapWithHits} from './util';

const stories = storiesOf('Stats', module);

stories.addDecorator(withKnobs);

stories.add('default', () =>
  <WrapWithHits linkedStoryGroup="Stats">
    <div>
      <Stats />
      <div style={{display: 'none'}}>
        <RefinementList
          attributeName="category"
          defaultRefinement={['Dining']}
        />
      </div>
    </div>
  </WrapWithHits>
);
