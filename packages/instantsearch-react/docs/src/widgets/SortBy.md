---
title: SortBy
layout: api.ejs
nav_groups:
  - main
---

# SortBy

This widget lets you reorder your results. You'll need multiple indices for this to work.

There's also a `SortByLinks` that displays options in a list of links.

## Props

Name | Type | Default |Description
:- | :- | :- | :-
`items` | `[{label: ?node, index: string}]` | | The different options, with the corresponding index. Note that `label` must be a string when using `SortBy`.
`defaultSelectedIndex` | `?string` | | The default selected index.
`id` | `?string` | `q` | URL state serialization key. The state of this widget takes the form of a `string` (the current selected index).

### Theme

`root`

Only for `SortByLinks`: `item`, `itemLink`, `itemSelected`

## Implementing your own SortBy

See [Making your own widgets](../Customization.md) for more information on how to use the `connectSortBy` HOC.

```
import {connectSortBy} from 'instantsearch-react';

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

// `connectSortBy` accepts the same `id` and `defaultSelectedIndex` props as
// `SortBy`.
export default connectSortBy(MySortBy);
```
