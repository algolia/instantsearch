import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {SearchBox, extendTheme} from '../packages/react-instantsearch/dom';
import {withKnobs, object} from '@kadira/storybook-addon-knobs';
import {WrapWithHits} from './util';

const stories = storiesOf('SearchBox', module);

stories.addDecorator(withKnobs);

stories.add('default', () =>
  <WrapWithHits searchBox={false} hasPlayground={true} linkedStoryGroup="SearchBox">
    <SearchBox/>
  </WrapWithHits>
).add('extend theme', () =>
  <WrapWithHits searchBox={false}>
    <SearchBox
      theme={extendTheme(SearchBox.defaultClassNames, {
        submit: {
          backgroundColor: 'red',
        },
      })}
    />
  </WrapWithHits>
).add('playground', () =>
  <WrapWithHits searchBox={false}>
    <SearchBox
      translations={object('translate', {
        submit: null,
        reset: null,
        submitTitle: 'Submit your search query.',
        resetTitle: 'Clear your search query.',
        placeholder: 'Search your website.',
      })}
    />
  </WrapWithHits>
);
