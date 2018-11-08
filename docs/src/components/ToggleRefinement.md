---
title: ToggleRefinement
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 6
editable: true
githubSource: docs/src/components/ToggleRefinement.md
---

The toggle widget lets the user either:

* switch between two values for a single facetted attribute (free_shipping / not_free_shipping)
* toggle a faceted value on and off (only "Canon" for brands)

This widget is particularly useful if you have a boolean value in the records.

<a class="btn btn-static-theme" href="stories/?selectedKind=ais-toggle-refinement">🕹 try out live</a>

## Usage

```html
<ais-toggle-refinement attribute="free_shipping" label="Free Shipping" />
```

## Props

Name | Type | Default | Description | Required
---|---|---|---|---
attribute | `string` | - | Attribute to apply the filter to | Yes
label | `string` | - | Label for the checkbox | Yes
on | `string | number | boolean` | `true` | Refinement to enable if this widget is checked | -
off | `string | number | boolean` | - | Refinement to enable if this widget is not checked | -
class-names | Object | `{}` | Override class names | no

## Slots

Name | Scope | Description
---|---|---
default | `{ value: object, canRefine: boolean, refine: (value: object) => void, createURL: () => string }` | Slot to override the DOM output

## CSS classes

Here's a list of CSS classes exposed by this widget. To better understand the underlying DOM structure, have a look at the generated DOM in your browser.

Note that you can pass the prop `class-names`, with an object of class names and their replacement to override this.

Class name | Description
---|---
`ais-ToggleRefinement` | The root div of the widget
`ais-ToggleRefinement--noRefinement` | The root div of the widget with no refinement
`ais-ToggleRefinement-label` | The label of the toggle
`ais-ToggleRefinement-checkbox` | The checkbox of the toggle
`ais-ToggleRefinement-labelText` | The label text of the toggle
`ais-ToggleRefinement-count` | The count of the toggle
