---
title: HierarchicalMenu
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 6
editable: true
githubSource: docs/src/components/HierarchicalMenu.md
---

The hierarchical menu lets the user browse attributes using a tree-like structure. This is commonly used for multi-level categorization of products on e-commerce websites. From a UX point of view, we suggest not displaying more than two levels deep.

<a class="btn btn-static-theme" href="stories/?selectedKind=HierarchicalMenu">🕹 try out live</a>

## Usage

```html
<ais-hierarchical-menu
  :attributes="[
    'categories.lvl0',
    'categories.lvl1',
    'categories.lvl2',
  ]"
/>
```

## Props

Name | Type | Default | Description | Required
---|---|---|---|---
attributes | `string[]` | - | Array of attributes to use to generate the hierarchical menu | Yes
limit | `number` | `10` | Number of items to show | -
showMoreLimit | `number` | `20` | Number of items to show when the user clicked on "show more" | -
showMore | `boolean` | `false` | Whether or not to have the option to load more values | -
separator | `string` | - | Separator used in the attributes to separate level values | -
rootPath | `string` | - | Prefix path to use if the first level is not the root level | -
showParentLevel | `boolean` | `true` | Show the siblings of the selected parent level of the current refined value. This does not impact the root level | -
sortBy | `string[] | function` | `['name:asc']` | Array or function to sort the results by | -
transformItems | `(items: object[]) => object[]` | `x => x` | Function which receives the items, which will be called before displaying them. Should return a new array with the same shape as the original array. Useful for mapping over the items to transform, remove or reorder them | -
class-names | Object | `{}` | Override class names | no

## Slots

Name | Scope | Description
---|---|---
default | `{ items: object[], canRefine: boolean, canToggleShowMore: boolean, isShowingMore: boolean, refine: (value: string) => void, createURL: (value: string) => string, toggleShowMore: () => void }` | Slot to override the DOM output
showMoreLabel | `{ isShowingMore: boolean }` | Slot to override the show more label

## CSS classes

Here's a list of CSS classes exposed by this widget. To better understand the underlying DOM structure, have a look at the generated DOM in your browser.

Note that you can pass the prop `class-names`, with an object of class names and their replacement to override this.

Class name | Description
---|---
`ais-HierarchicalMenu` | The root div of the widget
`ais-HierarchicalMenu--noRefinement` | The root div of the widget with no refinement
`ais-HierarchicalMenu-list` | The list of menu items
`ais-HierarchicalMenu-list--child` | The child list of menu items
`ais-HierarchicalMenu-list--lvl0` | The level 0 list of menu items
`ais-HierarchicalMenu-list--lvl1` | The level 1 list of menu items (and so on)
`ais-HierarchicalMenu-item` | The menu list item
`ais-HierarchicalMenu-item--selected` | The selected menu list item
`ais-HierarchicalMenu-item--parent` | The menu list item containing children
`ais-HierarchicalMenu-link` | The clickable menu element
`ais-HierarchicalMenu-label` | The label of each item
`ais-HierarchicalMenu-count` | The count of each item
`ais-HierarchicalMenu-showMore` | The button used to display more categories
`ais-HierarchicalMenu-showMore--disabled` | The disabled button used to display more categories
