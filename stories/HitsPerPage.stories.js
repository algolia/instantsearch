import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {HitsPerPage, Panel} from '../packages/react-instantsearch/dom';
import {withKnobs, number} from '@kadira/storybook-addon-knobs';
import {WrapWithHits} from './util';

const stories = storiesOf('HitsPerPage', module);

stories.addDecorator(withKnobs);

stories.add('default', () =>
  <WrapWithHits linkedStoryGroup="HitsPerPage" >
    <HitsPerPage
      defaultRefinement={4}
      items={[{value: 2, label: '2 hits per page'},
        {value: 4, label: '4 hits per page'},
        {value: 6, label: '6 hits per page'},
        {value: 8, label: '8 hits per page'}]}/>
  </WrapWithHits>
).add('without label', () =>
  <WrapWithHits linkedStoryGroup="HitsPerPage" >
    <HitsPerPage
      defaultRefinement={4}
      items={[{value: 2},
        {value: 4},
        {value: 6},
        {value: 8}]}/>
  </WrapWithHits>
).add('playground', () =>
  <WrapWithHits >
    <HitsPerPage
      defaultRefinement={number('default hits per page', 4)}
      items={[{value: 2, label: '2 hits per page'},
        {value: 4, label: '4 hits per page'},
        {value: 6, label: '6 hits per page'},
        {value: 8, label: '8 hits per page'}]}/>
  </WrapWithHits>
).add('inside a panel', () =>
  <WrapWithHits>
    <Panel title="Hits to display">
      <HitsPerPage
        defaultRefinement={number('default hits per page', 4)}
        items={[{value: 2, label: '2 hits per page'},
          {value: 4, label: '4 hits per page'},
          {value: 6, label: '6 hits per page'},
          {value: 8, label: '8 hits per page'}]}/>
    </Panel>
  </WrapWithHits>
);
