---
title: EmptyQuery
layout: widget.pug
nav_groups:
  - widgets
---

# EmptyQuery

Conditional component that only renders its single child when the current query is empty.

## Implementing your own EmptyQuery

See [Making your own widgets](../Customization.md) for more information on how to use the `EmptyQuery.connect` HOC.

```
import {EmptyQuery.connect} from 'react-instantsearch';

function MyEmptyQuery(props) {
  if (props.emptyQuery) {
    return (
      <div>Oh no, the query is empty!</div>
    );
  }
  return <div>Sweet, the query is not empty.</div>;
}

export default EmptyQuery.connect(MyEmptyQuery);
```
