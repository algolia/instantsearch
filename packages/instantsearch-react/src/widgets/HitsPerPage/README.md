---
title: HitsPerPage
layout: api.ejs
nav_groups:
  - widgets
---

# HitsPerPage

Lets the user select how many hits should be displayed at once.

There's also a `HitsPerPageSelect` which renders a select control.

## Props

Name | Type | Default |Description
:- | :- | :- | :-
`defaultHitsPerPage` | `number` | | The default state of the widget.
`items` | `oneOfType([number], [object])` | | The available list of options. Can be either a list of numbers, or a list of `{label: node, value: number}` items. Note that in the case of `HitsPerPageSelect`, the `label` property of an item must be a `string`.
`id` | `?string` | `hPP` | URL state serialization key. The state of this widget takes the shape of a `number`, which represents the value of the current selected item.

### Theme

`root`

Only for `HitsPerPage`: `item`, `itemSelected`

## Implementing your own HitsPerPage

See [Making your own widgets](../Customization.md) for more information on how to use the `HitsPerPage.connect` HOC.

```
import {HitsPerPage} from 'instantsearch-react';

function Option(props) {
  return (
    <a
      className={props.selected ? 'selected' : 'not-selected'}
      onClick={e => {
        e.preventDefault();
        props.refine(props.value);
      }}
      href={props.createURL(props.value)}
    >
      {props.value}
    </a>
  )
}

function MyHitsPerPage(props) {
  return (
    <div>
      <Option
        value={25}
        selected={props.hitsPerPage === 25}
        refine={props.refine}
        createURL={props.createURL}
      />
      <Option
        value={50}
        selected={props.hitsPerPage === 50}
        refine={props.refine}
        createURL={props.createURL}
      />
    </div>
  );
}

// `HitsPerPage.connect` accepts the same `id` and `defaultHitsPerPage` props as
// `HitsPerPage`.
export default HitsPerPage.connect(MySearchBox);
```
