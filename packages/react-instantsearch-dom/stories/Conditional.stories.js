import { storiesOf } from '@storybook/react';
import React from 'react';
import { connectStateResults } from 'react-instantsearch-dom';

import { WrapWithHits } from './util';

const stories = storiesOf('Conditionals', module);

stories
  .add('NoResults/HasResults', () => {
    const Content = connectStateResults(({ searchState, searchResults }) =>
      searchResults && searchResults.nbHits !== 0 ? (
        <div>Some results</div>
      ) : (
        <div>No results has been found for {searchState.query}</div>
      )
    );
    return (
      <WrapWithHits linkedStoryGroup="Conditional.stories.js">
        <Content />
      </WrapWithHits>
    );
  })
  .add('NoQuery/HasQuery', () => {
    const Content = connectStateResults(({ searchState }) =>
      searchState && searchState.query ? (
        <div>The query {searchState.query} exists</div>
      ) : (
        <div>No query</div>
      )
    );
    return (
      <WrapWithHits linkedStoryGroup="Conditional.stories.js">
        <Content />
      </WrapWithHits>
    );
  })
  .add('NoLoading/HasQuery', () => {
    const Content = connectStateResults(({ searching }) =>
      searching ? <div>searching</div> : <div>No searching</div>
    );
    return (
      <WrapWithHits linkedStoryGroup="Conditional.stories.js">
        <Content />
      </WrapWithHits>
    );
  });
