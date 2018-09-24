---
title: Autocomplete
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 6
editable: true
githubSource: docs/src/components/Autocomplete.md
---

Autocomplete is a component which can be used for third-party dropdown components. For one index, or additional indices.

<a class="btn btn-static-theme" href="stories/?selectedKind=Autocomplete">🕹 try out live</a>

## Usage

If you want to see what you have access to, simply fill in nothing in 

```html
<ais-autocomplete></ais-autocomplete>
```

## Props

Name | Type | Default | Description | Required
---|---|---|---|---
indices | `Array<{label: String, value: String}>` | `[]` | Additional indices to search in | no
escapeHTML | Boolean | true | Escape raw HTML in the hits | no
classNames | Object | | Override class names | no

## Slots

Name | Scope | Description
---|---|---
default | `{ currentRefinement: string, refine: (value: string) => void, indices: Array<Index> }` | Slot to override the DOM output

`Index` is an object which contains:

Key | Type | Description
---|---|---
index | `String` | The name (value) of this index
label | `String` | The label for this index
hits | `Object[]` | The hits resolved from the index matching the query.
results | `Object` | The full results object from the Algolia API.

## CSS classes

Here's a list of CSS classes exposed by this widget. To better understand the underlying
DOM structure, have a look at the generated DOM in your browser.

Note that you can pass the prop `class-names`, with an object of class names and their replacement to override this.

Class name | Description
---|---
`ais-Autocomplete` | Container class
