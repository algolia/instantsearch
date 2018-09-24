---
title: Breadcrumb
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 6
editable: true
githubSource: docs/src/components/Breadcrumb.md
---

The breadcrumb widget allows you to visualise which level of a hierarchical facet is currently selected.

<a class="btn btn-static-theme" href="stories/?selectedKind=Breadcrumb">🕹 try out live</a>

## Usage

```html
<ais-breadcrumb
  :attributes="[
    'categories.lvl0',
    'categories.lvl1',
  ]"
/>
```

## Props

Name | Type | Default | Description | Required
---|---|---|---|---
attributes | `string[]` | - | Array of attributes to use to generate the breadcrumb | Yes
separator | `string` | - | Separator used in the attributes to separate level values (mainly used to sync the options with a hierarchical menu) | -
rootPath | `string` | - | Prefix path to use if the first level is not the root level (mainly used to sync the options with a hierarchical menu) | -
transformItems | `(items: object[]) => object[]` | `x => x` | Function which receives the items, which will be called before displaying them. Should return a new array with the same shape as the original array. Useful for mapping over the items to transform, remove or reorder them | -
classNames | Object | | Override class names | no

## Slots

Name | Scope | Description
---|---|---
default | `{ canRefine: boolean, refine: (value: string) => void, createURL: (value: string) => string }` | Slot to override the DOM output
rootLabel | - | Slot to override the root label
separator | - | Slot to override the separator

## CSS classes

Here's a list of CSS classes exposed by this widget. To better understand the underlying DOM structure, have a look at the generated DOM in your browser.

Note that you can pass the prop `class-names`, with an object of class names and their replacement to override this.

Class name | Description
---|---
`ais-Breadcrumb` | The root div of the widget
`ais-Breadcrumb--noRefinement` | The root div of the widget with no refinement
`ais-Breadcrumb-list` | The list of all breadcrumb items
`ais-Breadcrumb-item` | The breadcrumb navigation item
`ais-Breadcrumb-item--selected` | The selected breadcrumb item
`ais-Breadcrumb-separator` | The separator of each breadcrumb item
`ais-Breadcrumb-link` | The clickable breadcrumb element
