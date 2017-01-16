import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {SearchBox} from '../packages/react-instantsearch/dom';
import {withKnobs, object} from '@kadira/storybook-addon-knobs';
import {WrapWithHits} from './util';

const stories = storiesOf('SearchBox', module);

stories.addDecorator(withKnobs);

stories.add('default', () =>
  <WrapWithHits searchBox={false} hasPlayground={true} linkedStoryGroup="SearchBox">
    <SearchBox/>
  </WrapWithHits>
).add('with a default query', () =>
  <WrapWithHits searchBox={false} hasPlayground={true} linkedStoryGroup="SearchBox">
    <SearchBox defaultRefinement="battery" />
  </WrapWithHits>
)
.add('playground', () =>
  <WrapWithHits searchBox={false}>
    <SearchBox
      focusShortcuts={['s']}
      searchAsYouType={true}
      autoFocus={true}
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
