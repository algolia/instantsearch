---
title: Conditional Display
layout: guide.pug
nav_groups:
  - core
nav_sort: 1
---

Sometimes, you will need to render some widgets instead of another if the query hits no results or if there is currently
no query used. 

To do that you can use the `createConnector` function we provide for [making your own widget](Customization.html#creating-your-own-connectors). 

Let's see some examples:

## Conditionally displaying content based on query state

```js
const Content = createConnector({
    displayName: 'ConditionalQuery',
    getProps(props, state) {
      return {query: state.q};
    },
 })(({query}) => {
    const content = query
      ? <div>The query {query} exists</div>
      : <div>No query</div>;
    return <div>{content}</div>;
 });
```

## Conditionally displaying content based on hits results 

```js
const content = createConnector({
    displayName: 'ConditionalResults',
    getProps(props, state, search) {
      const noResults = search.results ? search.results.nbHits === 0 : false;
      return {query: state.q, noResults};
    },
 })(({noResults, query}) => {
    const content = noResults
      ? <div>No results has been found for {query}</div>
      : <div>Some results</div>;
    return <div>{content}</div>;
 });
```