---
title: Loading
layout: widget.pug
nav_groups:
  - widgets
---

# Loading

Conditional component that only renders its single child when results are being fetched.

## Implementing your own Loading

See [Making your own widgets](../Customization.md) for more information on how to use the `Loading.connect` HOC.

```
import {Loading} from 'react-instantsearch';

function MyLoading(props) {
  if (props.loading) {
    return <div>Loading!</div>
  }
  return null;
}

export default Loading.connect(MyLoading);
```
