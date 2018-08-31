---
title: ClearRefinements
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 8
editable: true
githubSource: docs/src/components/ClearRefinements.md
---

A button that clears the `query`, the `active refinements`, or both when pressed.

<a class="btn btn-static-theme" href="stories/?selectedKind=ClearRefinements">🕹 try out live</a>

## Usage

```html
<ais-clear-refinements />
```

## Props

Name | Type | Default | Description | Required
---|---|---|---|---
clearsQuery | `boolean` | `false` | Also clears the query | -
excludedAttributes | `string[]` | `[]` | Attributes not to clear | -

## Slots

Name | Scope | Description
---|---|---
default | `{ canRefine: boolean, refine: () => void, createURL: () => void }` | Slot to override the DOM output
resetLabel | - | Slot to override the reset label

## CSS classes

Here's a list of CSS classes exposed by this widget. To better understand the underlying DOM structure, have a look at the generated DOM in your browser.

Class name | Description
---|---
`ais-ClearRefinements` | The root div of the widget
`ais-ClearRefinements-button` | The clickable button
`ais-ClearRefinements-button--disabled` | The disabled clickable button
