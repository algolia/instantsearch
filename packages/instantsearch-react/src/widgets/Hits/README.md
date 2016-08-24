---
title: Hits
layout: api.ejs
nav_groups:
  - widgets
---

# Hits

Displays the list of hits for the current search parameters.

## Props

Name | Type | Default |Description
:- | :- | :- | :-
`itemComponent` | `func` | | Component to render each hit with. The component will called with a `hit` prop.
`hitsPerPage` | `?number` | | How many hits should be displayed for every page. Ignored when a `HitsPerPage` component is also present.

### Theme

`root`

## Implementing your own Hits

See [Making your own widgets](../Customization.md) for more information on how to use the `Hits.connect` HOC.

```
import {Hits} from 'instantsearch-react';

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
