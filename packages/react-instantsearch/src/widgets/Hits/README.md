---
title: Hits
layout: api.pug
nav_groups:
  - widgets
---

# Hits

Displays the list of hits for the current search parameters.

## Props

<!-- props default ./index.js -->

### Theme

`root`

## Implementing your own Hits

See [Making your own widgets](../Customization.md) for more information on how to use the `Hits.connect` HOC.

```
import {Hits} from 'react-instantsearch';

function MyHits(props) {
  return (
    <div>
      {props.hits.map(hit =>
        <HitComponent key={hit.objectID} hit={hit} />
      )}
    </div>
  );
}

// `Hits.connect` accepts the same `hitsPerPage` prop as `Hits`.
export default Hits.connect(MyHits);
```
