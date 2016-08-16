---
title: Stats
layout: api.ejs
nav_groups:
  - main
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

```
import {connectStats} from 'instantsearch-react';

function MyStats(props) {
  return (
    <div>
      Found {props.nbHits} in {props.processingTimeMS}ms.
    </div>
  );
}

export default connectStats(MyStats);
```
