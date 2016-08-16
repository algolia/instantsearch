---
title: Loading
layout: api.ejs
nav_groups:
  - main
---

# Loading

Conditional component that only renders its single child when results are being fetched.

## Props

Name | Type | Default |Description
:- | :- | :- | :-

## Implementing your own Loading

```
import {connectLoading} from 'instantsearch-react';

function MyLoading(props) {
  if (props.loading) {
    return <div>Loading!</div>
  }
  return null;
}

export default connectLoading(MyLoading);
```
