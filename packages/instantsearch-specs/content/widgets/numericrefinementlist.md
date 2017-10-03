---
title: NumericRefinementList
type: widget
html: |
  <div class="ais-NumericRefinementList">
    <ul class="ais-NumericRefinementList-list">
      <li class="ais-NumericRefinementList-item ais-NumericRefinementList-item--selected">
        <label class="ais-NumericRefinementList-label">
          <input class="ais-NumericRefinementList-radio" type="radio" name="NumericRefinementList" checked="" /> All
        </label>
      </li>
      <li class="ais-NumericRefinementList-item">
        <label class="ais-NumericRefinementList-label">
          <input class="ais-NumericRefinementList-radio" type="radio" name="NumericRefinementList" /> Less than 500
        </label>
      </li>
    </ul>
  </div>
classes:
  - name: .ais-NumericRefinementList
    description: the root div of the widget
  - name: .ais-NumericRefinementList-list
    description: the list of all refinement items
  - name: .ais-NumericRefinementList-item
    description: the refinement list item
  - name: .ais-NumericRefinementList-item--selected
    description: the selected refinement list item
  - name: .ais-NumericRefinementList-label
    description: the label of each refinement item
  - name: .ais-NumericRefinementList-radio
    description: the radio input of each refinement item
---
