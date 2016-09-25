---
title: Stats
layout: widget.pug
nav_groups:
  - widgets
---

# Stats

The `Stats` widget lets you display how many results matched the query and how fast the search was.

### Theme

`root`

### Translations

`stats(nbHits, processingTimeMS)`

## Implementing your own Stats

See [Making your own widgets](../Customization.md) for more information on how to use the `Stats.connect` HOC.

```
import {Stats} from 'react-instantsearch';

function MyStats(props) {
  return (
    <div>
      Found {props.nbHits} in {props.processingTimeMS}ms.
    </div>
  );
}

export default Stats.connect(MyStats);
```
