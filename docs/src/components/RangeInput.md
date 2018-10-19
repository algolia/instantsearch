---
title: RangeInput
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 6
editable: true
githubSource: docs/src/components/RangeInput.md
---

The range input widget allows a user to select a numeric range using a minimum and maximum input.

<a class="btn btn-static-theme" href="stories/?selectedKind=RangeInput">🕹 try out live</a>

## Usage

```html
<ais-range-input :attribute="attribute"></ais-range-input>
```

## Props

Name | Type | Default | Description | Required
---|---|---|---|---
attribute | String | `defaultValue` | The name of the attribute in your record | yes
min | Number | - | Minimum value of the range | no
max | Number | - | Maximum value of the range | no
precision | Number | 0 | Number of digits after the decimal point to enforce | no
class-names | Object | | Override class names | no

## CSS classes

Here's a list of CSS classes exposed by this widget. To better understand the underlying
DOM structure, have a look at the generated DOM in your browser.

Note that you can pass the prop `class-names`, with an object of class names and their replacement to override this.

## Slots

Name | Scope | Description
---|---|---
default | `{ refine: (min, max) => void, currentRefinements: [number, number], noRefinements, range: {min: number, max: number}}` | Slot to override the DOM output. `refine` takes the updated values and then trigger the search. The `currentRefinements` contains the min and the max as set in the search state (and should be used to render the input values).
minLabel | | Slot for giving the min input a label
maxLabel | | Slot for giving the max input a label
separator| | Slot for modifying the separator between the two inputs
submitLabel | | Slot for modifying the label on the submit button


Class name | Description
---|---
`ais-RangeInput` | Container class
`ais-RangeInput--noRefinement` | Class added on the container when there are no refinements possible
`ais-RangeInput-form` | The form wrapper around the inputs and the submit button
`ais-RangeInput-separator` | The separator between the min and the max
`ais-RangeInput-button` | The button that triggers the submission of the form submission of the form
`ais-RangeInput-label` | Enclosing label of an input
`ais-RangeInput-input` | An input
`ais-RangeInput-input--min` | The minimum bound of the range
`ais-RangeInput-input--max` | The maximum bound of the range

class-names | Object | | Override class names | no
