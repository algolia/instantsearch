---
layout: ../../layouts/WidgetLayout.astro
title: SortBy
type: widget
html: |
  <div class="ais-SortBy">
    <select class="ais-SortBy-select" aria-label="Sort results by">
      <option class="ais-SortBy-option" value="Most relevant">Most relevant</option>
      <option class="ais-SortBy-option" value="Lowest price">Lowest price</option>
    </select>
  </div>
classes:
  - name: .ais-SortBy
    description: the root div of the widget
  - name: .ais-SortBy-select
    description: the select
  - name: .ais-SortBy-option
    description: the select option
options:
  - name: items
    description: Array of objects with value (the index to search on) and a label
  - name: transformItems
    description: Function which receives the items, which will be called before displaying them. Should return a new array with the same shape as the original array. Useful for mapping over the items to transform, remove or reorder them
---
