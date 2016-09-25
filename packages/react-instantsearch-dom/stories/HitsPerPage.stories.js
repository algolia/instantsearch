import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {HitsPerPage} from '../packages/react-instantsearch';
import {withKnobs, number} from '@kadira/storybook-addon-knobs';
import Wrapper from './util';

const stories = storiesOf('HitsPerPage', module);

stories.addDecorator(withKnobs);

stories.add('default ', () =>
  <Wrapper >
    <HitsPerPage
      defaultHitsPerPage={20}
      items={[10, 20, 30, 40]}/>
  </Wrapper>
).add('defaultSelect', () =>
  <Wrapper >
    <HitsPerPage.Select
      defaultHitsPerPage={20}
      items={[{value: 10}, {value: 20}, {value: 30}, {value: 40}]}/>
  </Wrapper>
).add('with label', () =>
  <Wrapper >
    <HitsPerPage.Select
      defaultHitsPerPage={30}
      items={[{value: 10, label: '10 hits per page'},
        {value: 20, label: '20 hits per page'},
        {value: 30, label: '30 hits per page'},
        {value: 40, label: '40 hits per page'}]}/>
  </Wrapper>
).add('playground', () =>
    <Wrapper >
      <HitsPerPage.Select
        defaultHitsPerPage={number('defaultHitsPerPage', 10)}
        items={[{value: 10, label: '10 hits per page'},
          {value: 20, label: '20 hits per page'},
          {value: 30, label: '30 hits per page'},
          {value: 40, label: '40 hits per page'}]}/>
    </Wrapper>
  );
