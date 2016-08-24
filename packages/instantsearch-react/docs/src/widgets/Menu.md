---
title: Menu
layout: api.ejs
nav_groups:
  - main
---

# Menu

Lets the user pick between a list of refinement values for a particular facet. Only one value can ever be selected at once.

There's also a `MenuSelect` which renders a select control.

## Props

Name | Type | Default |Description
:- | :- | :- | :-
`attributeName` | `string` | | Name of the attribute for faceting
`id` | `?string` | | URL state serialization key. Defaults to the value of `attributeName`. The state of this widget takes the shape of a `string`, which corresponds to the value of the currently selected refinement.
`showMore` | `?bool` | `false` | Display a show more button for increasing the number of refinement values from `limitMin` to `limitMax`.
`limitMin` | `?number` | `10` | Minimum number of refinement values.
`limitMax` | `?number` | `20` | Maximum number of refinement values. Ignored when `showMore` is `false`.
`sortBy` | `?[string]` | `['count:desc', 'name:asc']` | How to sort refinement values. See [the helper documentation](https://community.algolia.com/algoliasearch-helper-js/reference.html#specifying-a-different-sort-order-for-values) for the full list of options.
`defaultSelectedItem` | `?string` | | The default state of this widget.

### Theme

`root`

Only for `Menu`: `items`, `item`, `itemSelected`, `itemLink`, `itemLabel`, `itemCount`, `showMore`

### Translations

Only for `MenuSelect`: `count(n)` (should return a `string`)

Only for `Menu`: `count(n)`, `showMore(isExtended)`

## Implementing your own Menu

```
import {connectMenu} from 'instantsearch-react';

function MyMenu(props) {
  return (
    <div>
      {props.items.map(item =>
        <a
          key={item.value}
          className={
            props.selectedItem === item.value ?
              'selected' :
              'not-selected'
          }
          href={props.createURL(item.value)}
          onClick={e => {
            e.preventDefault();
            props.refine(item.value);
          }}
        >
          {item.value} ({item.count})
        </a>
      )}
    </div>
  );
}

// `connectMenu` accepts the same `id`, `attributeName`, `sortBy`,
// `defaultSelectedItems`, `showMore`, `limitMin` and `limitMax` props
// as `Menu`.
// When `showMore === true`, `limitMax` facet values will be retrieved.
// Otherwise, `limitMin` facet values will be retrieved.
export default connectMenu(MyMenu);
```
