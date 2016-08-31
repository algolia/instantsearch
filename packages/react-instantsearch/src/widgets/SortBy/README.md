---
title: SortBy
layout: api.ejs
nav_groups:
  - widgets
---

# SortBy

This widget lets you reorder your results. You'll need multiple indices for this to work.

There's also a `SortByLinks` that displays options in a list of links.

## SortBy Props

<!-- props default ./index.js -->

## SortBy.Links Props

<!-- props default.Links ./index.js -->

### Theme

`root`

Only for `SortByLinks`: `item`, `itemLink`, `itemSelected`

## Implementing your own SortBy

See [Making your own widgets](../Customization.md) for more information on how to use the `SortBy.connect` HOC.

```
import {SortBy.connect} from 'instantsearch-react';

function Option(props) {
  return (
    <a
      onClick={e => {
        e.preventDefault();
        props.refine(props.index)
      }}
      href={props.createURL(props.index)}
    >
      {props.label}
    </a>
  );
}

function MySortBy(props) {
  return (
    <div>
      <Option
        index="index_price_asc"
        label="Price (asc)"
        refine={props.refine}
        createURL={props.createURL}
      />
      <Option
        index="index_price_desc"
        label="Price (desc)"
        refine={props.refine}
        createURL={props.createURL}
      />
    </div>
  );
}

// `SortBy.connect` accepts the same `id` and `defaultSelectedIndex` props as
// `SortBy`.
export default SortBy.connect(MySortBy);
```
