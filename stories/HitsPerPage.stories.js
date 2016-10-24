import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {HitsPerPage} from '../packages/react-instantsearch/dom';
import {withKnobs, number} from '@kadira/storybook-addon-knobs';
import {WrapWithHits} from './util';

const stories = storiesOf('HitsPerPage', module);

stories.addDecorator(withKnobs);

stories.add('default ', () =>
  <WrapWithHits >
    <HitsPerPage
      defaultRefinement={4}
      items={[2, 4, 6, 8]}/>
  </WrapWithHits>
).add('defaultSelect', () =>
  <WrapWithHits >
    <HitsPerPage.Select
      defaultRefinement={4}
      items={[{value: 2}, {value: 4}, {value: 6}, {value: 8}]}/>
  </WrapWithHits>
).add('with label', () =>
  <WrapWithHits >
    <HitsPerPage.Select
      defaultRefinement={4}
      items={[{value: 2, label: '2 hits per page'},
        {value: 4, label: '4 hits per page'},
        {value: 6, label: '6 hits per page'},
        {value: 8, label: '8 hits per page'}]}/>
  </WrapWithHits>
).add('playground', () =>
    <WrapWithHits >
      <HitsPerPage.Select
        defaultRefinement={number('default hits per page', 4)}
        items={[{value: 2, label: '2 hits per page'},
          {value: 4, label: '4 hits per page'},
          {value: 6, label: '6 hits per page'},
          {value: 8, label: '8 hits per page'}]}/>
    </WrapWithHits>
  );
