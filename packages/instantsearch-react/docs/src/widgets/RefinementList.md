---
title: RefinementList
layout: api.ejs
nav_groups:
  - main
---

# RefinementList

Lets the user pick between a list of refinement values for a particular facet.

There's also a `RefinementListLinks` which renders items as links.

## Props

Name | Type | Default |Description
:- | :- | :- | :-
`attributeName` | `string` | | Name of the attribute for faceting
`id` | `?string` | | URL state serialization key. Defaults to the value of `attributeName`. The state of this widget takes the form of a list of `string`s, which correspond to the values of all selected refinements. However, when there are no refinements selected, the value of the state is an empty string.
`operator` | `?oneOf('and', 'or')` | `'or'` | How to apply the refinements.
`showMore` | `?bool` | `false` | Display a show more button for increasing the number of refinement values from `limitMin` to `limitMax`.
`limitMin` | `?number` | `10` | Minimum number of refinement values.
`limitMax` | `?number` | `20` | Maximum number of refinement values. Ignored when `showMore` is `false`.
`sortBy` | `?[string]` | `['count:desc', 'name:asc']` | How to sort refinement values. See [the helper documentation](https://community.algolia.com/algoliasearch-helper-js/reference.html#specifying-a-different-sort-order-for-values) for the full list of options.
`defaultSelectedItems` | `?[string]` | `[]` | The default state of this widget, as an array of facet values.

### Theme

`root`, `items`, `item`, `itemSelected`, `itemLabel`, `itemCount`, `showMore`

Only for `RefinementListLinks`: `itemLink`

### Translations

`showMore(isExtended)`, `count(n)`

## Implementing your own RefinementList

See [Making your own widgets](../Customization.md) for more information on how to use the `connectRefinementList` HOC.

```
import {connectRefinementList} from 'instantsearch-react';

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

// `connectRefinementList` accepts the same `id`, `attributeName`, `operator`,
// `sortBy`, `defaultSelectedItems`, `showMore`, `limitMin` and `limitMax` props
// as `RefinementList`.
// When `showMore === true`, `limitMax` facet values will be retrieved.
// Otherwise, `limitMin` facet values will be retrieved.
export default connectRefinementList(MyRefinementList);
```
