---
title: NumericRefinementList
layout: api.ejs
nav_groups:
  - widgets
---

# NumericRefinementList

Lets the user pick between a list of refinement ranges for a particular numeric facet.

## Props
attributeName: PropTypes.string.isRequired,

Name | Type | Default |Description
:- | :- | :- | :-
`attributeName` | `string` | | Name of the attribute for faceting
`items` | `[object]` | | List of options. Items should have the shape `{label: ?none, start: ?number, end: ?number}`, where `start` represents the inclusive starting value of the range, and `end` the inclusive ending value.
`id` | `?string` | | URL state serialization key. Defaults to the value of `attributeName`. The state of this widget takes the shape of a `string` with a pattern of `'{start}:{end}'` which corresponds to the current selected item. For instance, when the selected item is `{start: 10, end: 20}`, the state of the widget is `'10:20'`. When `start` isn't defined, the state of the widget is `:{end}`, and the same way around when `end` isn't defined. However, when neither `start` nor `end` are defined, the state is an empty string.

### Theme

`root`, `items`, `item`, `itemSelected`, `itemLabel`

## Implementing your own NumericRefinementList

See [Making your own widgets](../Customization.md) for more information on how to use the `NumericRefinementList.connect` HOC.

```
import {NumericRefinementList.connect} from 'instantsearch-react';

function Item(props) {
  const value = props.selected ? null : props.item.value;
  return (
    <a
      key={item.value}
      className={props.selected ? 'selected' : 'not-selected'}
      href={props.createURL(value)}
      onClick={e => {
        e.preventDefault();
        props.refine(value);
      }}
    >
      {item.label}
    </a>
  );
}

function MyNumericRefinementList(props) {
  return (
    <div>
      {props.items.map(item =>
        <Item
          key={item.value}
          item={item}
          selected={item.value === props.selectedItem}
          refine={props.refine}
          createURL={props.createURL}
        />
      )}
    </div>
  );
}

// `NumericRefinementList.connect` accepts the same `id`, `attributeName` and
// `items` props as `NumericRefinementList`.
// `items` are transformed into a simpler `{label: ?node, value: string}`
// shape before being passed to the connected component.
export default NumericRefinementList.connect(MyNumericRefinementList);
```
