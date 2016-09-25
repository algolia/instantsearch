import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {InstantSearch, Toggle} from '../packages/react-instantsearch';
import {withKnobs} from '@kadira/storybook-addon-knobs';

const stories = storiesOf('Toggle', module);

stories.addDecorator(withKnobs);

stories.add('default', () =>
  <InstantSearch
    className="container-fluid"
    appId="latency"
    apiKey="6be0576ff61c053d5f9a3225e2a90f76"
    indexName="bestbuy"
  >
    <Toggle attributeName="shipping"
            label="Free Shipping"
            value="Free Shipping"
    />
  </InstantSearch>
);
