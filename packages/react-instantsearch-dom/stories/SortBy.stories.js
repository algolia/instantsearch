import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {SortBy} from '../packages/react-instantsearch/dom';
import {withKnobs} from '@kadira/storybook-addon-knobs';
import {WrapWithHits} from './util';

const stories = storiesOf('SortBy', module);

stories.addDecorator(withKnobs);

stories.add('default', () =>
  <WrapWithHits >
    <SortBy
      items={[
        {value: 'ikea', label: 'Featured'},
        {value: 'ikea_price_asc', label: 'Price asc.'},
        {value: 'ikea_price_desc', label: 'Price desc.'},
      ]}
      defaultRefinement="ikea"
    />
  </WrapWithHits>
);
