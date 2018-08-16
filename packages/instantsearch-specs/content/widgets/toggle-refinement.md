---
title: ToggleRefinement
type: widget
html: |
  <div class="ais-ToggleRefinement">
    <label class="ais-ToggleRefinement-label">
      <input class="ais-ToggleRefinement-checkbox" type="checkbox" value="Free Shipping" />
      <span class="ais-ToggleRefinement-labelText">Free Shipping</span>
    </label>
  </div>
classes:
  - name: .ais-ToggleRefinement
    description: the root div of the widget
  - name: .ais-ToggleRefinement-label
    description: the label of the toggle
  - name: .ais-ToggleRefinement-checkbox
    description: the checkbox input of the toggle
  - name: .ais-ToggleRefinement-labelText
    description: the label text of the toggle
  - name: .ais-ToggleRefinement-count
    description: the count of items of the toggle
options:
  - name: attribute
    description: Attribute to apply the filter to
  - name: 'on'
    description: Refinement to enable if this widget is checked
  - name: 'off'
    description: Refinement to enable if this widget is not checked
---
