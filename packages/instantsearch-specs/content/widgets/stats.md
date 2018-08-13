---
title: Stats
type: widget
html: |
  <div class="ais-Stats">
    <span class="ais-Stats-text">20,337 results found in 1ms.</span>
  </div>
classes:
  - name: .ais-Stats
    description: the root div of the widget
  - name: .ais-Stats-text
    description: the text of the widget
    description: the count of items for each item
options:
  - name: transformItems
    description: Function which receives the items, which will be called before displaying them. Should return a new array with the same shape as the original array. Useful for mapping over the items to transform, remove or reorder them
---
