---
title: NumericMenu
type: widget
html: |
  <div class="ais-NumericMenu">
    <div class="ais-NumericMenu-header ais-header">
      Numeric menu
    </div>
    <div class="ais-NumericMenu-body ais-body">
      <ul class="ais-NumericMenu-list">
        <li class="ais-NumericMenu-item ais-NumericMenu-item--selected">
          <label class="ais-NumericMenu-label">
            <input class="ais-NumericMenu-radio" type="radio" name="NumericRefinementList" checked="" /> All
          </label>
        </li>
        <li class="ais-NumericMenu-item">
          <label class="ais-NumericMenu-label">
            <input class="ais-NumericMenu-radio" type="radio" name="NumericRefinementList" /> Less than 500
          </label>
        </li>
      </ul>
    </div>
    <div class="ais-NumericMenu-footer ais-footer">
      Footer info
    </div>
  </div>
classes:
  - name: .ais-NumericMenu
    description: the root div of the widget
  - name: .ais-NumericMenu-header
    description: the header of the widget (optional)
  - name: .ais-NumericMenu-body
    description: the body of the widget
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
  - name: .ais-NumericMenu-footer
    description: the footer of the widget (optional)
---
