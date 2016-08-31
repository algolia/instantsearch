---
title: RefinementList
layout: api.ejs
nav_groups:
  - widgets
---

# RefinementList

Lets the user pick between a list of refinement values for a particular facet.

There's also a `RefinementListLinks` which renders items as links.

## Props

<!-- props default ./index.js -->

### Theme

`root`, `items`, `item`, `itemSelected`, `itemLabel`, `itemCount`, `showMore`

Only for `RefinementListLinks`: `itemLink`

### Translations

`showMore(isExtended)`, `count(n)`

## Implementing your own RefinementList

See [Making your own widgets](../Customization.md) for more information on how to use the `RefinementList.connect` HOC.

```
import {RefinementList.connect} from 'react-instantsearch';

function Item(props) {
  const selected = props.selectedItems.indexOf(props.item.value) !== -1;
  const value = selected ?
    props.selectedItems.filter(v => v !== props.item.value) :
    props.selectedItems.concat([props.item.value]);
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
      {item.value} ({item.count})
    </a>
  );
}

function MyRefinementList(props) {
  return (
    <div>
      {props.items.map(item =>
        <Item
          item={item}
          selectedItems={props.selectedItems}
          refine={props.refine}
          createURL={props.createURL}
        />
      )}
    </div>
  );
}

// `RefinementList.connect` accepts the same `id`, `attributeName`, `operator`,
// `sortBy`, `defaultSelectedItems`, `showMore`, `limitMin` and `limitMax` props
// as `RefinementList`.
// When `showMore === true`, `limitMax` facet values will be retrieved.
// Otherwise, `limitMin` facet values will be retrieved.
export default RefinementList.connect(MyRefinementList);
```
