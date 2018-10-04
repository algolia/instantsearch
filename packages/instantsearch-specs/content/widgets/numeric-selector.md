---
title: NumericSelector
type: widget
info: This component does not need to be implemented and can be removed in major versions.
html: |
  <div class="ais-NumericSelector">
    <select class="ais-NumericSelector-select">
      <option class="ais-NumericSelector-option" value="10">Top 10</option>
      <option class="ais-NumericSelector-option" value="500">Top 500</option>
    </select>
  </div>
classes:
  - name: .ais-NumericSelector
    description: the root div of the widget
  - name: .ais-NumericSelector-select
    description: the select
  - name: .ais-NumericSelector-option
    description: the select options
options:
  - name: transformItems
    description: Function which receives the items, which will be called before displaying them. Should return a new array with the same shape as the original array. Useful for mapping over the items to transform, remove or reorder them
---
