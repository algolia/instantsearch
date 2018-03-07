---
title: ToggleRefinement
type: widget
html: |
  <div class="ais-ToggleRefinement">
    <ul class="ais-ToggleRefinement-list">
      <li class="ais-ToggleRefinement-item">
        <label class="ais-ToggleRefinement-label">
          <input class="ais-ToggleRefinement-checkbox" type="checkbox" value="Free Shipping" />
          <span class="ais-ToggleRefinement-labelText">Free Shipping</span>
          <span class="ais-ToggleRefinement-count">18,013</span>
        </label>
      </li>
    </ul>
  </div>
classes:
  - name: .ais-ToggleRefinement
    description: the root div of the widget
  - name: .ais-ToggleRefinement-list
    description: the list of toggles
  - name: .ais-ToggleRefinement-item
    description: the toggle list item
  - name: .ais-ToggleRefinement-label
    description: the label of each toggle item
  - name: .ais-ToggleRefinement-checkbox
    description: the checkbox input of each toggle item
  - name: .ais-ToggleRefinement-labelText
    description: the label text of each toggle item
  - name: .ais-ToggleRefinement-count
    description: the count of items for each item
options:
  - name: attribute
    description: Attribute to apply the filter to
  - name: values
    description: # I don't think both toggling A/B and A/- should be done by the same widget
---
