---
title: MultiRange
layout: widget.pug
nav_groups:
  - widgets
---

# MultiRange

Lets the user pick between a list of refinement ranges for a particular numeric facet.

## Props

<!-- props default ./index.js -->

### Theme

`root`, `items`, `item`, `itemSelected`, `itemLabel`, `itemLabelSelected`, `itemRadio`, `itemRadioSelected`

## Implementing your own MultiRange

See [Making your own widgets](../Customization.md) for more information on how to use the `MultiRange.connect` HOC.

```
import {MultiRange.connect} from 'react-instantsearch';

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

function MyMultiRange(props) {
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

// `MultiRange.connect` accepts the same `id`, `attributeName` and
// `items` props as `MultiRange`.
// `items` are transformed into a simpler `{label: ?node, value: string}`
// shape before being passed to the connected component.
export default MultiRange.connect(MyMultiRange);
```
