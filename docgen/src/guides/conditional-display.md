---
title: Conditional Display
layout: guide.pug
category: guide
navWeight: 1
---

Using our connector and [`createConnector`](create-own-widget.html) approach, you can 
conditionally displayed content based on the search state. 

Below are some typical use cases when using conditional display makes sense but don't hesitate to read the 
[create your own widget documentation](create-own-widget.html), it will give you more details 
about the api. 

## Displaying content when the query is empty

You can do that by using the [`createConnector`](create-own-widget.html) function and
then access the `state` of all widgets. By doing so you're able to get the query and decide what to do according to its state.

Here's an example:

```javascript
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

## Displaying content when there's no results 
 
By using the [`createConnector`](create-own-widget.html) function you may also access the `search` object 
that holds the search results, search errors and search loading state. By doing so you're able to get the number of hits 
returned and decide what to do according to this number. 

Here's an example: 

```javascript
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

## Displaying content when there's an error
 
By using the [`createConnector`](create-own-widget.html) function you may also access the `search` object 
that holds the search results, search errors and search loading state. By doing so you're able to know when an error occurred and 
decide what to do with it. 

Here's an example: 

```javascript
const content = createConnector({
    displayName: 'ConditionalError',
    getProps(props, state, search) {
      return {error: search.error};
    },
 })(({error}) => {
    const content = error
      ? <div>An error occurred: {error.message}</div>
      : <div>Some results</div>;
    return <div>{content}</div>;
 });
```



