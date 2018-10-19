---
title: HitsPerPage
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 6
editable: true
githubSource: docs/src/components/HitsPerPage.md
---

Displays a `select` element allowing users to choose the number of hits to display.

<a class="btn btn-static-theme" href="stories/?selectedKind=HitsPerPage">🕹 try out live</a>

## Usage

```html
<ais-hits-per-page
  :items="[{
    label: '20 results',
    value: 20,
    default
  }, {
    label: '100 results',
    value: 100
  }]"
  ></ais-hits-per-page>
```

## Props

Name | Type | Required | Default | Description |
---|---|---|---|---
items | `[<Object>, ...]` | yes | no | Array of possible values for the select, example: <br/>`[{label: 'Ten results', value: 10, default}, {label: 'Twenty results', value: 20}]`.<br/>The item with `default: true` will be the one applied by default.
transformItems | `(items: object[]) => object[]` | `x => x` | Function which receives the items, which will be called before displaying them. Should return a new array with the same shape as the original array. Useful for mapping over the items to transform, remove or reorder them | -
class-names | Object | | Override class names | no

Name | Scope | Description
---|---|---
default | `{ items: Array<{label: String, value: String}>, refine({label: String, value: String}), hasNoResults: Boolean }` | Slot to override the DOM output

## CSS classes

Here's a list of CSS classes exposed by this widget. To better understand the underlying
DOM structure, have a look at the generated DOM in your browser.

Note that you can pass the prop `class-names`, with an object of class names and their replacement to override this.

Class name | Description
---|---
`ais-HitsPerPage` | Container class
`ais-HitsPerPage-select` | A refinement option
