---
title: Toggle
layout: api.ejs
nav_groups:
  - widgets
---

# Toggle

The `Toggle` widget is where users type their search queries.

## Props

<!-- props default ./index.js -->

### Theme

`root`, `checkbox`, `label`

## Implementing your own Toggle

See [Making your own widgets](../Customization.md) for more information on how to use the `Toggle.connect` HOC.

```
import {Toggle} from 'react-instantsearch';

function MyToggle(props) {
  return (
    <input
      type="checkbox"
      checked={props.checked}
      onChange={e => props.refine(!e.target.value)}
    />
  );
}

// `Toggle.connect` accepts the same `id`, `label`, `filter`, `attributeName`,
// `value` and `defaultChecked` props as `Toggle`.
export default Toggle.connect(MyToggle);
```
