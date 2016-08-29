---
title: SearchBox
layout: api.ejs
nav_groups:
  - widgets
---

# SearchBox

The `SearchBox` widget is where users type their search queries.

## Props

<!-- props default ./index -->

### Theme

`root`, `wrapper`, `input`, `submit`, `reset`

### Translations

`submit`, `reset`, `submitTitle`, `resetTitle`, `placeholder`

## Implementing your own SearchBox

See [Making your own widgets](../Customization.md) for more information on how to use the `SearchBox.connect` HOC.

```
import {SearchBox.connect} from 'instantsearch-react';

function MySearchBox(props) {
  return (
    <input
      value={props.query}
      onChange={e => props.refine(e.target.value)}
    />
  );
}

// `SearchBox.connect` accepts the same `id` prop as `SearchBox`.
export default SearchBox.connect(MySearchBox);
```
