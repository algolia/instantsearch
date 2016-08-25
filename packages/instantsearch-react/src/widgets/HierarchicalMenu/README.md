---
title: HierarchicalMenu
layout: api.ejs
nav_groups:
  - widgets
---

# HierarchicalMenu

The hierarchical menu is a widget that lets the user explore a tree-like structure. This is commonly used for multi-level categorization of products on e-commerce websites. From a UX point of view, we suggest not displaying more than two levels deep.

## Props

Name | Type | Default |Description
:- | :- | :- | :-
`id` | `string` | | URL state serialization key. The state of this widget takes the shape of a `string`, which corresponds to the full path of the current selected refinement.
`attributes` | `[string]` | | List of attributes to use to generate the hierarchy of the menu. See the example for the convention to follow.
`showMore` | `?bool` | `false` | Display a show more button for increasing the number of refinement values from `limitMin` to `limitMax`.
`limitMin` | `?number` | `10` | Minimum number of refinement values.
`limitMax` | `?number` | `20` | Maximum number of refinement values. Ignored when `showMore` is `false`.
`defaultSelectedItem` | `?string` | | Default state of this widget.
`separator` | `?string` | ` > ` | Separator used in the attributes to separate level values.
`rootPath` | `?string` | | Prefix path to use if the first level is not the root level.
`showParentLevel` | `?bool` | `false` | Show the parent level of the current refined value
`sortBy` | `?[string]` | `['name:asc']` | How to sort refinement values. See [the helper documentation](https://community.algolia.com/algoliasearch-helper-js/reference.html#specifying-a-different-sort-order-for-values) for the full list of options.

### Theme

`root`, `items`, `item`, `itemSelected`, `itemParent`, `itemSelectedParent`, `itemLink`, `itemLabel`, `itemCount`, `itemChildren`, `showMore`

### Translations

`showMore(isExtended)`, `count(n)`

## Example

```
import {HierarchicalMenu} from 'instantsearch-react';

export default Menu() {
  return (
    <HierarchicalMenu
      name="categories"
      attributes={[
        'hierarchicalCategories.lvl0',
        'hierarchicalCategories.lvl1',
        'hierarchicalCategories.lvl2',
      ]}
    />
  );
}
```

## Implementing your own HierarchicalMenu

See [Making your own widgets](../Customization.md) for more information on how to use the `HierarchicalMenu.connect` HOC.

```
import {HierarchicalMenu.connect} from 'instantsearch-react';

function Item(props) {
  return (
    <div key={props.item.value}>
      <a
        className={
          props.selectedItems.indexOf(props.item.value) !== -1 ?
            'selected' :
            'not-selected'
        }
        href={createURL(props.item.value)}
        onClick={e => {
          e.preventDefault();
          props.refine(props.item.value);
        }}
      >
        {props.item.value} ({props.item.count})
      </a>

      <div>
        {props.item.children && props.item.children.map(child =>
          <Item
            item={child}
            selectedItems={props.selectedItems}
            createURL={props.createURL}
            refine={props.refine}
          />
        )}
      </div>
    </div>
  );
}

function MyHierarchicalMenu(props) {
  return (
    <div>
      {props.items.map(item =>
        <Item
          item={item}
          selectedItems={props.selectedItems}
          createURL={props.createURL}
          refine={props.refine}
        />
      )}
    </div>
  );
}

// `HierarchicalMenu.connect` accepts the same `name`, `attributes`, `showMore`,
// `limitMin`, `limitMax`, `defaultSelectedItem`, `separator`, `rootPath`,
// `showParentLevel` and `sortBy` props as `HierarchicalMenu`.
// When `showMore === true`, `limitMax` facet values will be retrieved.
// Otherwise, `limitMin` facet values will be retrieved.
export default HierarchicalMenu.connect(MyHierarchicalMenu);
```
