---
title: Stats
layout: api.ejs
nav_groups:
  - widgets
---

# Stats

The `Stats` widget is where users type their search queries.

## Props

Name | Type | Default |Description
:- | :- | :- | :-

### Theme

`root`

### Translations

`stats(nbHits, processingTimeMS)`

## Implementing your own Stats

See [Making your own widgets](../Customization.md) for more information on how to use the `Stats.connect` HOC.

```
import {Stats} from 'instantsearch-react';

function MyStats(props) {
  return (
    <div>
      Found {props.nbHits} in {props.processingTimeMS}ms.
    </div>
  );
}

export default Stats.connect(MyStats);
```
