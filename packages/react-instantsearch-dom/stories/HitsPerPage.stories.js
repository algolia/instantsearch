import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {HitsPerPage} from '../packages/react-instantsearch';
import {withKnobs, number} from '@kadira/storybook-addon-knobs';
import {WrapWithHits} from './util';

const stories = storiesOf('HitsPerPage', module);

stories.addDecorator(withKnobs);

stories.add('default ', () =>
  <WrapWithHits >
    <HitsPerPage
      defaultHitsPerPage={2}
      items={[2, 4, 6, 8]}/>
  </WrapWithHits>
).add('defaultSelect', () =>
  <WrapWithHits >
    <HitsPerPage.Select
      defaultHitsPerPage={2}
      items={[{value: 2}, {value: 4}, {value: 6}, {value: 8}]}/>
  </WrapWithHits>
).add('with label', () =>
  <WrapWithHits >
    <HitsPerPage.Select
      defaultHitsPerPage={2}
      items={[{value: 2, label: '2 hits per page'},
        {value: 4, label: '4 hits per page'},
        {value: 6, label: '6 hits per page'},
        {value: 8, label: '8 hits per page'}]}/>
  </WrapWithHits>
).add('playground', () =>
    <WrapWithHits >
      <HitsPerPage.Select
        defaultHitsPerPage={number('default hits per page', 2)}
        items={[{value: 2, label: '2 hits per page'},
          {value: 4, label: '4 hits per page'},
          {value: 6, label: '6 hits per page'},
          {value: 8, label: '8 hits per page'}]}/>
    </WrapWithHits>
  );
