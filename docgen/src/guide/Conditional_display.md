---
title: Conditional Display
mainTitle: Guide
layout: main.pug
category: guide
navWeight: 40
---

Using our connector and [`createConnector`](guide/Custom_connectors.html) approach, you can conditionally display content based on the search state.

## Displaying content when the query is empty

```javascript
const Content = createConnector({
    displayName: 'ConditionalQuery',
    getProvidedProps(props, searchState) {
      return {query: searchState.query};
    },
 })(({query}) => {
    const content = query
      ? <div>The query {query} exists</div>
      : <div>No query</div>;
    return <div>{content}</div>;
 });
```

## Displaying content when there's no results

```javascript
const content = createConnector({
    displayName: 'ConditionalResults',
    getProvidedProps(props, searchState, searchResults) {
      const noResults = searchResults.results ? searchResults.results.nbHits === 0 : false;
      return {query: searchState.query, noResults};
    },
 })(({noResults, query}) => {
    const content = noResults
      ? <div>No results has been found for {query}</div>
      : <div>Some results</div>;
    return <div>{content}</div>;
 });
```

## Displaying content when there's an error

```javascript
const content = createConnector({
    displayName: 'ConditionalError',
    getProvidedProps(props, searchState, searchResults) {
      return {error: searchResults.error};
    },
 })(({error}) => {
    const content = error
      ? <div>An error occurred: {error.message}</div>
      : <div>Some results</div>;
    return <div>{content}</div>;
 });
```

## Displaying content when loading

In slow user network situations you might want to know when the search results are loading.

```javascript
const content = createConnector({
    displayName: 'ConditionalError',
    getProvidedProps(props, searchState, searchResults) {
      return {loading: searchResults.loading};
    },
})(({loading}) => {
    const content = loading
      ? <div>We are loading</div>
      : <div>Search finished</div>;
    return <div>{content}</div>;
 });
```

<div class="guide-nav">
    <div class="guide-nav-left">
        Previous: <a href="guide/Custom_connectors.html">← Custom Connectors</a>
    </div>
    <div class="guide-nav-right">
        Next: <a href="guide/React_native.html">React native →</a>
    </div>
</div>
