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
).add('with submit and reset components', () =>
  <WrapWithHits searchBox={false} hasPlayground={true} linkedStoryGroup="SearchBox" >
    <SearchBox
      submitComponent={<span>🔍</span>}
      resetComponent={
        <svg viewBox="200 198 108 122">
          <path d="M200.8 220l45 46.7-20 47.4 31.7-34 50.4 39.3-34.3-52.6 30.2-68.3-49.7 51.7" />
        </svg>
      }
    />
  </WrapWithHits>
).add('playground', () =>
  <WrapWithHits searchBox={false}>
    <SearchBox
      focusShortcuts={['s']}
      searchAsYouType={true}
      autoFocus={true}
      translations={object('translations', {
        submit: null,
        reset: null,
        submitTitle: 'Submit your search query.',
        resetTitle: 'Clear your search query.',
        placeholder: 'Search your website.',
      })}
    />
  </WrapWithHits>
);
