import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {SortBy} from '../packages/react-instantsearch';
import {withKnobs} from '@kadira/storybook-addon-knobs';
import Wrapper from './util';

const stories = storiesOf('SortBy', module);

stories.addDecorator(withKnobs);

stories.add('default ', () =>
  <Wrapper >
    <SortBy
      items={[
        {value: 'ikea'},
        {value: 'ikea_price_asc'},
        {value: 'ikea_price_desc'},
      ]}
      defaultSelectedIndex="ikea"
    />
  </Wrapper>
).add('with labels', () =>
  <Wrapper >
    <SortBy
      items={[
        {value: 'ikea', label: 'Featured'},
        {value: 'ikea_price_asc', label: 'Price asc.'},
        {value: 'ikea_price_desc', label: 'Price desc.'},
      ]}
      defaultSelectedIndex="ikea"
    />
  </Wrapper>
).add('with links', () =>
  <Wrapper >
    <SortBy.Links
      items={[
        {value: 'ikea', label: 'Featured'},
        {value: 'ikea_price_asc', label: 'Price asc.'},
        {value: 'ikea_price_desc', label: 'Price desc.'},
      ]}
      defaultSelectedIndex="ikea"
    />
  </Wrapper>
);
