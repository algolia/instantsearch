---
title: Error
layout: api.ejs
nav_groups:
  - main
---

# Error

Displays an error when the Algolia Search client had an issue fetching the results set.

## Props

Name | Type | Default |Description
:- | :- | :- | :-

### Theme

`root`

### Translations

`error(err)`

## Implementing your own Error

See [Making your own widgets](../Customization.md) for more information on how to use the `connectError` HOC.

```
import {connectError} from 'instantsearch-react';

function MyError(props) {
  if (props.error) {
    return (
      <div>Oh no, there was an error! {error}</div>
    );
  }
  return null;
}

export default connectError(MyError);
```
