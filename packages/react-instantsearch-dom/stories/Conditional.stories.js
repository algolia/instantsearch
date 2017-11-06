import React from 'react';
import { storiesOf } from '@storybook/react';
import { connectStateResults } from '../packages/react-instantsearch/connectors';
import { WrapWithHits } from './util';
import { checkA11y } from 'storybook-addon-a11y';

const stories = storiesOf('Conditionals', module);

stories
  .addDecorator(checkA11y)
  .add('NoResults/HasResults', () => {
    const Content = connectStateResults(
      ({ searchState, searchResults }) =>
        searchResults && searchResults.nbHits !== 0 ? (
          <div>Some results</div>
        ) : (
          <div>No results has been found for {searchState.query}</div>
        )
    );
    return (
      <WrapWithHits linkedStoryGroup="Conditional">
        <Content />
      </WrapWithHits>
    );
  })
  .add('NoQuery/HasQuery', () => {
    const Content = connectStateResults(
      ({ searchState }) =>
        searchState && searchState.query ? (
          <div>The query {searchState.query} exists</div>
        ) : (
          <div>No query</div>
        )
    );
    return (
      <WrapWithHits linkedStoryGroup="Conditional">
        <Content />
      </WrapWithHits>
    );
  })
  .add('NoLoading/HasQuery', () => {
    const Content = connectStateResults(
      ({ searching }) =>
        searching ? <div>searching</div> : <div>No searching</div>
    );
    return (
      <WrapWithHits linkedStoryGroup="Conditional">
        <Content />
      </WrapWithHits>
    );
  });
