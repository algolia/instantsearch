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

<a class="btn btn-static-theme" href="stories/?selectedKind=CurrentRefinements">🕹 try out live</a>

## Usage

```html
<ais-current-refinements :clears-query="true"></ais-current-refinements>
```

## Props

Name | Type | Default | Description | Required
---|---|---|---|---
transformItems | Function | | Allows you to format and change the attributes | -
clearsQuery | Boolean | `false` | Should the 'clear all' button also clear the query? | -
excludedAttributes | Array | `[]` | Attributes not to show or clear | -
transformItems | `(items: object[]) => object[]` | `x => x` | Function which receives the items, which will be called before displaying them. Should return a new array with the same shape as the original array. Useful for mapping over the items to transform, remove or reorder them | -
classNames | Object | | Override class names | no

## Slots

name | scope | Description
---|---|---
`default` | `{ items: Item[], refine: Item => void, clearAll: () => void }` | Override how all the items look
`item` | `{ item: Item, refine: Item => void }` | Override how an item looks
`clearAllLabel` | `{ items: Item[] }` | Override how the "clear all" button looks

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
