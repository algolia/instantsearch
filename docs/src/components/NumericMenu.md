---
title: NumericMenu
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 6
editable: true
githubSource: docs/src/components/NumericMenu.md
---

The numeric menu list is a widget that displays a list of numeric filters in a list. Those numeric filters are pre-configured when creating the widget.

<a class="btn btn-static-theme" href="stories/?selectedKind=NumericMenu">🕹 try out live</a>

## Usage

```html
<ais-numeric-menu
  attribute="price"
  :items="[
    { label: 'All' },
    { label: '<= 10$', end: 10 },
    { label: '10$ - 100$', start: 10, end: 100 },
    { label: '100$ - 500$', start: 100, end: 500 },
    { label: '>= 500$', start: 500 },
  ]"
/>
```

## Props

Name | Type | Default | Description | Required
---|---|---|---|---
attribute | String | - | The attribute | Yes
items | `Array<{ label: string, start?: number, end?: number }>` | - | Array of available options for the widget | Yes
transformItems | `(items: Array<{ label: string, value: string, isRefined: boolean }>)` | x => x | Function which receives the items, which will be called before displaying them. Should return a new array with the same shape as the original array. Useful for mapping over the items to transform, remove or reorder them | -
class-names | Object | `{}` | Override class names | no

## Slots

Name | Scope | Description
---|---|---
default | `{ items: Array<{label: String, value: String}>, canRefine: Boolean, refine: String => void, createURL: () => String }` | Slot to override the DOM output

## CSS classes

Here's a list of CSS classes exposed by this widget. To better understand the underlying DOM structure, have a look at the generated DOM in your browser.

Note that you can pass the prop `class-names`, with an object of class names and their replacement to override this.

Class name | Description
---|---
`.ais-NumericMenu` | the root div of the widget
`.ais-NumericMenu--noRefinement` | the root div of the widget with no refinement
`.ais-NumericMenu-list` | the list of all refinement items
`.ais-NumericMenu-item` | the refinement list item
`.ais-NumericMenu-item--selected` | the selected refinement list item
`.ais-NumericMenu-label` | the label of each refinement item
`.ais-NumericMenu-radio` | the radio input of each refinement item
`.ais-NumericMenu-labelText` | the label text of each refinement item
