---
title: HitsPerPage
type: widget
html: |
  <div class="ais-HitsPerPage">
    <select class="ais-HitsPerPage-select">
      <option class="ais-HitsPerPage-option" value="3">3 per page</option>
      <option class="ais-HitsPerPage-option" value="6">6 per page</option>
    </select>
  </div>
classes:
  - name: .ais-HitsPerPage
    description: the root div of the widget
  - name: .ais-HitsPerPage-select
    description: the select
  - name: .ais-HitsPerPage-option
    description: the select option
options:
  - name: items
    description: Array of objects with the value, the label and a boolean "default" which decides which item to select by default
  - name: transformItems
    description: Function which receives the items, which will be called before displaying them. Should return a new array with the same shape as the original array. Useful for mapping over the items to transform, remove or reorder them
---
