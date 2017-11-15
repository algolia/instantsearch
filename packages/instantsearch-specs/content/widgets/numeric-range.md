---
title: NumericRange
type: widget
html: |
  <div class="ais-NumericRange">
    <div class="ais-NumericRange-header ais-header">
      Numeric range
    </div>
    <div class="ais-NumericRange-body ais-body">
      <form class="ais-NumericRange-form">
        <label class="ais-NumericRange-label"><span class="ais-NumericRange-currency">$ </span>
          <input class="ais-NumericRange-input" type="number" />
        </label>
        <span class="ais-NumericRange-separator"> to </span>
        <label class="ais-NumericRange-label"><span class="ais-NumericRange-currency">$ </span>
          <input class="ais-NumericRange-input" type="number" />
        </label>
        <button class="ais-NumericRange-submit" type="submit">Go</button>
      </form>
    </div>
    <div class="ais-NumericRange-footer ais-footer">
      Footer info
    </div>
  </div>
classes:
  - name: .ais-NumericRange
    description: the root div of the widget
  - name: .ais-NumericRange-header
    description: the header of the widget (optional)
  - name: .ais-NumericRange-body
    description: the body of the widget
  - name: .ais-NumericRange-form
    description: the wrapping form
  - name: .ais-NumericRange-label
    description: the label wrapping inputs
  - name: .ais-NumericRange-currency
    description: the currency used next to each input
  - name: .ais-NumericRange-input
    description: the input (number)
  - name: .ais-NumericRange-separator
    description: the separator word used between the two inputs
  - name: .ais-NumericRange-button
    description: the submit button
  - name: .ais-NumericRange-footer
    description: the footer of the widget (optional)
---
