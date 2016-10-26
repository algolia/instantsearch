---
title: Conditional Display
layout: guide.pug
nav_groups:
  - core
nav_sort: 1
---

Using our connector and [`createConnector`](Customization.html#creating-your-own-connectors) approach, you can 
conditionally displayed content based on the search state. 

Below are some typical use cases when using conditional display makes sense but don't hesitate to read the 
[making your own widget documentation](Customization.html#creating-your-own-connectors), it will give you more details 
about the api. 

## Displaying content when the query is empty

You can do that by using the [`createConnector`](Customization.html#creating-your-own-connectors) function and
then access the `state` of all widgets. By doing so you're able to get the query and decide what to do according to its state.

Here's an example:

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

## Displaying content when there's no results 
 
By using the [`createConnector`](Customization.html#creating-your-own-connectors) function you may also access the `search` object 
that holds the search results, search errors and search loading state. By doing so you're able to get the number of hits 
returned and decide what to do according to this number. 

Here's an example: 

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

