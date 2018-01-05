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
---
