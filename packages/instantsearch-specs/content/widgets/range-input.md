---
title: RangeInput
type: widget
html: |
  <div class="ais-RangeInput">
    <div class="ais-RangeInput-header ais-header">
      Numeric range
    </div>
    <div class="ais-RangeInput-body ais-body">
      <form class="ais-RangeInput-form">
        <label class="ais-RangeInput-label"><span class="ais-RangeInput-currency">$ </span>
          <input class="ais-RangeInput-input" type="number" />
        </label>
        <span class="ais-RangeInput-separator"> to </span>
        <label class="ais-RangeInput-label"><span class="ais-RangeInput-currency">$ </span>
          <input class="ais-RangeInput-input" type="number" />
        </label>
        <button class="ais-RangeInput-submit" type="submit">Go</button>
      </form>
    </div>
    <div class="ais-RangeInput-footer ais-footer">
      Footer info
    </div>
  </div>
classes:
  - name: .ais-RangeInput
    description: the root div of the widget
  - name: .ais-RangeInput-header
    description: the header of the widget (optional)
  - name: .ais-RangeInput-body
    description: the body of the widget
  - name: .ais-RangeInput-form
    description: the wrapping form
  - name: .ais-RangeInput-label
    description: the label wrapping inputs
  - name: .ais-RangeInput-currency
    description: the currency used next to each input
  - name: .ais-RangeInput-input
    description: the input (number)
  - name: .ais-RangeInput-separator
    description: the separator word used between the two inputs
  - name: .ais-RangeInput-button
    description: the submit button
  - name: .ais-RangeInput-footer
    description: the footer of the widget (optional)
---
