---
title: HierarchicalMenu
layout: widget.pug
nav_groups:
  - widgets
---

# HierarchicalMenu

The hierarchical menu is a widget that lets the user explore a tree-like structure. This is commonly used for multi-level categorization of products on e-commerce websites. From a UX point of view, we suggest not displaying more than two levels deep.

## Props

<!-- props default ./index.js -->

### Theme

`root`, `items`, `item`, `itemSelected`, `item_parent`, `itemSelectedParent`, `itemLink`, `itemLabel`, `itemCount`, `itemChildren`, `showMore`

### Translations

`showMore(isExtended)`, `count(n)`

## Example

```
import {HierarchicalMenu} from 'react-instantsearch';

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
import {HierarchicalMenu.connect} from 'react-instantsearch';

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
