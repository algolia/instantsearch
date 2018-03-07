---
title: ClearRefinements
type: widget
html: |
  <div class="ais-ClearRefinements">
    <button class="ais-ClearRefinements-button">
      Clear refinements
    </button>
  </div>
alt1: Button disabled
althtml1: |
  <div class="ais-ClearRefinements">
    <button class="ais-ClearRefinements-button ais-ClearRefinements-button--disabled" disabled>
      Clear refinements
    </button>
  </div>
classes:
  - name: .ais-ClearRefinements
    description: the root div of the widget
  - name: .ais-ClearRefinements-button
    description: the clickable button
  - name: .ais-ClearRefinements-button--disabled
    description: the disabled clickable button
options:
  - name: excludedAttributes
    description: Attributes not to clear
  - name: clearsQuery
    default: false
    description: Also clears the query
---
