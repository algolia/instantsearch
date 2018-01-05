---
title: RangeInput
type: widget
html: |
  <div class="ais-RangeInput">
    <form class="ais-RangeInput-form">
      <label class="ais-RangeInput-label">
        <span class="ais-RangeInput-currency">$</span>
        <input class="ais-RangeInput-input ais-RangeInput-input--min" type="number" />
      </label>
      <span class="ais-RangeInput-separator">to</span>
      <label class="ais-RangeInput-label">
        <span class="ais-RangeInput-currency">$</span>
        <input class="ais-RangeInput-input ais-RangeInput-input--max" type="number" />
      </label>
      <button class="ais-RangeInput-submit" type="submit">Go</button>
    </form>
  </div>
classes:
  - name: .ais-RangeInput
    description: the root div of the widget
  - name: .ais-RangeInput-form
    description: the wrapping form
  - name: .ais-RangeInput-label
    description: the label wrapping inputs
  - name: .ais-RangeInput-currency
    description: the currency used next to each input
  - name: .ais-RangeInput-input
    description: the input (number)
  - name: .ais-RangeInput-input--min
    description: the minimum input
  - name: .ais-RangeInput-input--max
    description: the maximum input
  - name: .ais-RangeInput-separator
    description: the separator word used between the two inputs
  - name: .ais-RangeInput-button
    description: the submit button
---
