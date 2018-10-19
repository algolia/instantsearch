---
title: InfiniteHits
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 6
editable: true
githubSource: docs/src/components/InfiniteHits.md
---

Displays an infinite list of hits along with a load more button.

<a class="btn btn-static-theme" href="stories/?selectedKind=InfiniteHits">🕹 try out live</a>

## Usage

```html
<ais-infinite-hits></ais-infinite-hits>
```

## Props

Name | Type | Default | Description | Required
---|---|---|---|---
escapeHTML | Boolean | true | Escape raw HTML in the hits | no
transformItems | `(items: object[]) => object[]` | `x => x` | Function which receives the items, which will be called before displaying them. Should return a new array with the same shape as the original array. Useful for mapping over the items to transform, remove or reorder them | -
class-names | Object | | Override class names | no

## Slots

Name | Scope | Description
---|---|---
default | `{ items: Array<Item>, refine: () => void }` | Slot to override the DOM output
item | `{ item: Item, index: Number }` | Slot to override the DOM output.

Where `Item` is a single hit with all its attribute, and `index` is the absolute position of this hit.

## CSS classes

Here's a list of CSS classes exposed by this widget. To better understand the underlying
DOM structure, have a look at the generated DOM in your browser.

Note that you can pass the prop `class-names`, with an object of class names and their replacement to override this.

Class name | Description
---|---
`ais-InfiniteHits` | The root div of the widget
`ais-InfiniteHits-list` | The list of hits
`ais-InfiniteHits-item` | The hit list item
`ais-InfiniteHits-loadMore` | The button used to display more results
`ais-InfiniteHits-loadMore--disabled` | The disabled button used to display more results
