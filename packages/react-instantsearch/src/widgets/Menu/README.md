---
title: Menu
layout: api.ejs
nav_groups:
  - widgets
---

# Menu

Lets the user pick between a list of refinement values for a particular facet. Only one value can ever be selected at once.

There's also a `MenuSelect` which renders a select control.

## Menu Props

<!-- props default ./index.js -->

### Theme

`root`

Only for `Menu`: `items`, `item`, `itemSelected`, `itemLink`, `itemLabel`, `itemCount`, `showMore`

### Translations

Only for `MenuSelect`: `count(n)` (should return a `string`)

Only for `Menu`: `count(n)`, `showMore(isExtended)`

## Implementing your own Menu

See [Making your own widgets](../Customization.md) for more information on how to use the `Menu.connect` HOC.

```
import {Menu} from 'react-instantsearch';

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

// `Menu.connect` accepts the same `id`, `attributeName`, `sortBy`,
// `defaultSelectedItems`, `showMore`, `limitMin` and `limitMax` props
// as `Menu`.
// When `showMore === true`, `limitMax` facet values will be retrieved.
// Otherwise, `limitMin` facet values will be retrieved.
export default Menu.connect(MyMenu);
```
