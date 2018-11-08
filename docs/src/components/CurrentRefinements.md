---
title: CurrentRefinements
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 6
editable: true
githubSource: docs/src/components/current-refinements.md
---

Show the currently refined values and allow them to be unset.

<a class="btn btn-static-theme" href="stories/?selectedKind=ais-current-refinements">🕹 try out live</a>

## Usage

```html
<template>
  <ais-current-refinements
    :excluded-attributes="[]"
    :transform-items="transformItems"
  />
</template>

<script>
export default {
  data() {
    return {
      transformItems: items =>
        items.map(item => ({
          ...label,
          label: item.label.toLocaleUpperCase()
        }))
    };
  }
};
</script>
```

## Props

Name | Type | Default | Description | Required
---|---|---|---|---
includedAttributes | Array | | Attributes to show or clear | -
excludedAttributes | Array | `['query']` | Attributes not to show or clear | -
transformItems | `(items: object[]) => object[]` | `x => x` | Function which receives the items, which will be called before displaying them. Should return a new array with the same shape as the original array. Useful for mapping over the items to transform, remove or reorder them | -
class-names | Object | `{}` | Override class names | no

Note that you can not use `includedAttributes` and `excludedAttributes` at the same time. Included attributes are exclusive, and thus take precedence over excluded attributes.

## Slots

name | scope | Description
---|---|---
`default` | `{ items: Item[], refine: Item => void, createURL: Item.value => string }` | Override how all the items look
`item` | `{ item: Item, refine: Item => void, createURL: () => string }` | Override how an item looks

All elements in `items` have the keys:

* `type`: which can be "facet", "exclude", "disjunctive", "hierarchical", "numeric" or "query"
* `attribute`: used as the key
* `label`: string form of the value
* `value`: necessary for the refinement to work correctly, no need to be changed

## CSS classes

Here's a list of CSS classes exposed by this widget. To better understand the underlying
DOM structure, have a look at the generated DOM in your browser.

Note that you can pass the prop `class-names`, with an object of class names and their replacement to override this.

Class name | Description
---|---
`ais-CurrentRefinements` | Container class
`ais-CurrentRefinements--noRefinement` | Modifier on the container when no refinements are enabled.
`ais-CurrentRefinements-item` | An item
`ais-CurrentRefinements-delete` | The button in the item to delete that refinement
`ais-CurrentRefinements-item--selected` | Selected item
