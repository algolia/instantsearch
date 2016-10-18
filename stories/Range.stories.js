import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {Range, extendTheme} from '../packages/react-instantsearch';
import {withKnobs, object, number} from '@kadira/storybook-addon-knobs';
import {WrapWithHits} from './util';

const stories = storiesOf('Range', module);

stories.addDecorator(withKnobs);

stories.add('default', () =>
  <WrapWithHits >

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
).add('extend theme', () =>
  <WrapWithHits >
    <Range attributeName="price"
           theme={extendTheme(Range.defaultClassNames, {
             track: {
               background: 'red',
             },
             trackSelected: {
               backgroundColor: 'green',
             },
             handleDot: {
               backgroundColor: 'green',
             },
           })}
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
