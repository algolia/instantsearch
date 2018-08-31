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

## CSS classes

Here's a list of CSS classes exposed by this widget. To better understand the underlying
DOM structure, have a look at the generated DOM in your browser.

Class name | Description
---|---
`ais-InfiniteHits` | The root div of the widget
`ais-InfiniteHits-list` | The list of hits
`ais-InfiniteHits-item` | The hit list item
`ais-InfiniteHits-loadMore` | The button used to display more results
`ais-InfiniteHits-loadMore--disabled` | The disabled button used to display more results
