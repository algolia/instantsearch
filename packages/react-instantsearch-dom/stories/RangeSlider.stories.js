import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {withKnobs, object, number} from '@kadira/storybook-addon-knobs';
import {WrapWithHits} from './util';
import Range from './3rdPartiesIntegration.stories';
const stories = storiesOf('RangeSlider', module);

stories.addDecorator(withKnobs);

stories.add('default', () =>
  <WrapWithHits hasPlayground={true} linkedStoryGroup="RangeSlider">

    <Range attributeName="price"/>
  </WrapWithHits>
).add('providing default value', () =>
  <WrapWithHits >

    <Range attributeName="price"
           defaultRefinement={{min: 50, max: 200}}
    />
  </WrapWithHits>
).add('custom min/max bounds', () =>
  <WrapWithHits >

    <Range attributeName="price"
           min={30}
           max={100}
    />
  </WrapWithHits>
).add('playground', () =>
  <WrapWithHits >

    <Range attributeName="price"
           defaultRefinement={object('default value', {min: 150, max: 200})}
           min={number('min', 100)}
           max={number('max', 400)}
    />
  </WrapWithHits>
);
