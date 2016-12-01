import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {createConnector} from '../packages/react-instantsearch';
import {WrapWithHits} from './util';

const stories = storiesOf('Conditionals', module);

stories.add('NoResults/HasResults', () => {
  const Content = createConnector({
    displayName: 'ConditionalResults',
    getProps(props, state, search) {
      const noResults = search.results ? search.results.nbHits === 0 : false;
      return {query: state.query, noResults};
    },
  })(({noResults, query}) => {
    const content = noResults
      ? <div>No results has been found for {query}</div>
      : <div>Some results</div>;
    return <div>{content}</div>;
  });
  return <WrapWithHits>
    <Content/>
  </WrapWithHits>;
}).add('NoQuery/HasQuery', () => {
  const Content = createConnector({
    displayName: 'ConditionalQuery',
    getProps(props, state) {
      return {query: state.query};
    },
  })(({query}) => {
    const content = query
      ? <div>The query {query} exists</div>
      : <div>No query</div>;
    return <div>{content}</div>;
  });
  return <WrapWithHits>
    <Content/>
  </WrapWithHits>;
});
