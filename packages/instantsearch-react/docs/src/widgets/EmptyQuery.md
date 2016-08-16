---
title: EmptyQuery
layout: api.ejs
nav_groups:
  - main
---

# EmptyQuery

Conditional component that only renders its single child when the current query is empty.

## Props

Name | Type | Default |Description
:- | :- | :- | :-

## Implementing your own EmptyQuery

```
import {connectEmptyQuery} from 'instantsearch-react';

function MyEmptyQuery(props) {
  if (props.emptyQuery) {
    return (
      <div>Oh no, the query is empty!</div>
    );
  }
  return <div>Sweet, the query is not empty.</div>;
}

export default connectEmptyQuery(MyEmptyQuery);
```
