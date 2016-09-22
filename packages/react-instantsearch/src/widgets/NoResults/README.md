---
title: NoResults
layout: widget.pug
nav_groups:
  - widgets
---

# NoResults

Conditional component that only renders its single child when the current results set is empty.

## Implementing your own NoResults

See [Making your own widgets](../Customization.md) for more information on how to use the `NoResults.connect` HOC.

```
import {NoResults.connect} from 'react-instantsearch';

function MyNoResults(props) {
  if (props.noResults) {
    return (
      <div>Oh no, we couldn't find any results!</div>
    );
  }
  return null;
}

export default NoResults.connect(MyNoResults);
```
