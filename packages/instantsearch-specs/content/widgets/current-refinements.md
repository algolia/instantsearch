---
title: CurrentRefinements
type: widget
html: |
  <div class="ais-CurrentRefinements">
    <ul class="ais-CurrentRefinements-list">
      <li class="ais-CurrentRefinements-item">
        <span class="ais-CurrentRefinements-label">
          Category:
        </span>
        <span class="ais-CurrentRefinements-category">
          <span class="ais-CurrentRefinements-categoryLabel">Movies & TV Shows</span>
          <button class="ais-CurrentRefinements-delete">✕</button>
        </span>
        <span class="ais-CurrentRefinements-category">
          <span class="ais-CurrentRefinements-categoryLabel">Others</span>
          <button class="ais-CurrentRefinements-delete">✕</button>
        </span>
      </li>
    </ul>
    <button class="ais-CurrentRefinements-reset">
      Clear all
    </button>
  </div>
classes:
  - name: .ais-CurrentRefinements
    description: the root div of the widget
  - name: .ais-CurrentRefinements-list
    description: the list of all refined items
  - name: .ais-CurrentRefinements-item
    description: the refined list item
  - name: .ais-CurrentRefinements-label
    description: the refined list label
  - name: .ais-CurrentRefinements-category
    description: the category of each item
  - name: .ais-CurrentRefinements-categoryLabel
    description: the label of each catgory
  - name: .ais-CurrentRefinements-delete
    description: the delete button of each catgory
  - name: .ais-CurrentRefinements-reset
    description: the reset button for current selected values
options:
  - name: attributes
    description: Label definitions for the different filters.
  - name: whitelist
    description: list of attributes to show
  - name: blacklist
    description: list of attributes not to show
  - name: clearsQuery
    default: false
    description: The clear all button also clears the query
---
