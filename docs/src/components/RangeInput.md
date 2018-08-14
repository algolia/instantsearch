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
precision | Number | - | Number of digits after the decimal point to enforce | no

## CSS classes

Here's a list of CSS classes exposed by this widget. To better understand the underlying
DOM structure, have a look at the generated DOM in your browser.

Class name | Description
---|---
`ais-RangeInput` | Container class
`ais-RangeInput-form` | The form wrapper around the inputs and the submit button
`ais-RangeInput-separator` | The separator between the min and the max 
`ais-RangeInput-submit` | The button that triggers the submission of the formubmission of the form
`ais-RangeInput-label` | Enclosing label of an input
`ais-RangeInput-input` | An input
`ais-RangeInput-input--min` | The minimum bound of the range
`ais-RangeInput-input--max` | The maximum bound of the range
`ais-RangeInput-item--selected` | Selected item