---
title: Toggle
layout: api.ejs
nav_groups:
  - main
---

# Toggle

The `Toggle` widget is where users type their search queries.

## Props

Name | Type | Default |Description
:- | :- | :- | :-
`id` | `?string` | `q` | URL state serialization key. The state of this widget takes the form of a `string` that can be either `'on'` or `'off'`.
`label` | `?string` | | Label for this toggle.
`filter` | `?func` | | Custom filter. Takes in a `SearchParameters` and returns a new `SearchParameters` with the filter applied.
`attributeName` | `?string` | | Name of the attribute on which to apply the `value` refinement. Required when `value` is present.
`value` | `?string` | | Value of the refinement to apply on `attributeName`. Required when `attributeName` is present.
`defaultChecked` | `?bool` | | Default state of the widget. Should the toggle be checked by default?

### Theme

`root`, `checkbox`, `label`

## Implementing your own Toggle

See [Making your own widgets](../Customization.md) for more information on how to use the `connectToggle` HOC.

```
import {connectToggle} from 'instantsearch-react';

function MyToggle(props) {
  return (
    <input
      type="checkbox"
      checked={props.checked}
      onChange={e => props.refine(!e.target.value)}
    />
  );
}

// `connectToggle` accepts the same `id`, `label`, `filter`, `attributeName`,
// `value` and `defaultChecked` props as `Toggle`.
export default connectToggle(MyToggle);
```
