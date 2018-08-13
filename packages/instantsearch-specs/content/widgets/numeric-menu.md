---
title: NumericMenu
type: widget
html: |
  <div class="ais-NumericMenu">
    <ul class="ais-NumericMenu-list">
      <li class="ais-NumericMenu-item ais-NumericMenu-item--selected">
        <label class="ais-NumericMenu-label">
          <input class="ais-NumericMenu-radio" type="radio" name="NumericMenu" checked="" />
          <span class="ais-NumericMenu-labelText">All</span>
        </label>
      </li>
      <li class="ais-NumericMenu-item">
        <label class="ais-NumericMenu-label">
          <input class="ais-NumericMenu-radio" type="radio" name="NumericMenu" />
          <span class="ais-NumericMenu-labelText">Less than 500</span>
        </label>
      </li>
    </ul>
  </div>
classes:
  - name: .ais-NumericMenu
    description: the root div of the widget
  - name: .ais-NumericMenu--noRefinement
    description: the root div of the widget with no refinement
  - name: .ais-NumericMenu-list
    description: the list of all refinement items
  - name: .ais-NumericMenu-item
    description: the refinement list item
  - name: .ais-NumericMenu-item--selected
    description: the selected refinement list item
  - name: .ais-NumericMenu-label
    description: the label of each refinement item
  - name: .ais-NumericMenu-radio
    description: the radio input of each refinement item
  - name: .ais-NumericMenu-labelText
    description: the label text of each refinement item
options:
  - name: attribute
    description: Attribute to apply the filter to
  - name: items
    description: Array of objects with a label, start and end value. Start and end can individually be left as undefined to only apply a single bound
  - name: transformItems
    description: Function which receives the items, which will be called before displaying them. Should return a new array with the same shape as the original array. Useful for mapping over the items to transform, remove or reorder them
---
