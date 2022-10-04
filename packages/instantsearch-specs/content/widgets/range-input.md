---
title: RangeInput
type: widget
html: |
  <div class="ais-RangeInput">
    <form class="ais-RangeInput-form">
      <label class="ais-RangeInput-label">
        <input class="ais-RangeInput-input ais-RangeInput-input--min" type="number" />
      </label>
      <span class="ais-RangeInput-separator">to</span>
      <label class="ais-RangeInput-label">
        <input class="ais-RangeInput-input ais-RangeInput-input--max" type="number" />
      </label>
      <button class="ais-RangeInput-submit" type="submit">Go</button>
    </form>
  </div>
classes:
  - name: .ais-RangeInput
    description: the root div of the widget
  - name: .ais-RangeInput--noRefinement
    description: the root div of the widget with no refinement
  - name: .ais-RangeInput-form
    description: the wrapping form
  - name: .ais-RangeInput-label
    description: the label wrapping inputs
  - name: .ais-RangeInput-input
    description: the input (number)
  - name: .ais-RangeInput-input--min
    description: the minimum input
  - name: .ais-RangeInput-input--max
    description: the maximum input
  - name: .ais-RangeInput-separator
    description: the separator word used between the two inputs
  - name: .ais-RangeInput-submit
    description: the submit button
options:
  - name: attribute
    description: Attribute to apply the filter to
  - name: min
    description: Minimum value. When this isn’t set, the minimum value will be automatically computed by Algolia using the data in the index.
  - name: max
    description: Maximum value. When this isn’t set, the maximum value will be automatically computed by Algolia using the data in the index.
  - name: precision
    default: 0
    description: Number of digits after decimal point to use.
translations:
  - name: separatorElementText
    default: '"to"'
    description: The text for the separator element between the minimum and maximum inputs.
  - name: submitButtonText
    default: '"Go"'
    description: The text for the submit button.
---
