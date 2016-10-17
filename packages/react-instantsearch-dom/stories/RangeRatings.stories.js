import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {Range, extendTheme} from '../packages/react-instantsearch';
import {withKnobs, object, number} from '@kadira/storybook-addon-knobs';
import {WrapWithHits} from './util';

const stories = storiesOf('RangeRatings', module);

stories.addDecorator(withKnobs);

stories.add('default', () =>
  <WrapWithHits >
    <Range.Rating attributeName="rating" max={6}/>
  </WrapWithHits>
).add('extend theme', () =>
  <WrapWithHits >
    <Range.Rating
      attributeName="rating"
      max={6}
      theme={extendTheme(Range.Rating.defaultClassNames, {
        ratingLabelDisabled: {
          color: 'gray',
        },
      })}
    />
  </WrapWithHits>
).add('playground', () =>
  <WrapWithHits >

    <Range.Rating attributeName="rating"
                  max={number('max', 6)}
                  translations={object('translate', {ratingLabel: ' & Up'})}
    />
  </WrapWithHits>
);
