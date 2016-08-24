---
title: NoResults
layout: api.ejs
nav_groups:
  - main
---

# NoResults

Conditional component that only renders its single child when the current results set is empty.

## Props

Name | Type | Default |Description
:- | :- | :- | :-

## Implementing your own NoResults

See [Making your own widgets](../Customization.md) for more information on how to use the `connectNoResults` HOC.

```
import {connectNoResults} from 'instantsearch-react';

function MyNoResults(props) {
  if (props.noResults) {
    return (
      <div>Oh no, we couldn't find any results!</div>
    );
  }
  return null;
}

export default connectNoResults(MyNoResults);
```
