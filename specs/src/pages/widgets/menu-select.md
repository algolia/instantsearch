---
layout: ../../layouts/WidgetLayout.astro
title: MenuSelect
type: widget
html: |
  <div class="ais-MenuSelect">
    <select class="ais-MenuSelect-select">
      <option class="ais-MenuSelect-option" value="Most relevant">Appliances (4306)</option>
      <option class="ais-MenuSelect-option" value="Lowest price">Audio (1570)</option>
    </select>
  </div>
classes:
  - name: .ais-MenuSelect
    description: the root div of the widget
  - name: .ais-MenuSelect--noRefinement
    description: the root div of the widget with no refinement
  - name: .ais-MenuSelect-select
    description: the select
  - name: .ais-MenuSelect-option
    description: the select option
options:
  - name: attribute
    description: Attribute to apply the filter to
  - name: limit
    default: 10
    description: Number of items to show
  - name: sortBy
    description: array or function to sort the results by
  - name: transformItems
    description: Function which receives the items, which will be called before displaying them. Should return a new array with the same shape as the original array. Useful for mapping over the items to transform, remove or reorder them
---
