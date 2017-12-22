---
title: RefinementList
type: widget
html: |
  <div class="ais-RefinementList">
    <div class="ais-RefinementList-header ais-header">
      Refinement list
    </div>
    <div class="ais-RefinementList-body ais-body">
      <div class="ais-RefinementList-searchBox">
        <!-- SearchBox widget here -->
      </div>
      <ul class="ais-RefinementList-list">
        <li class="ais-RefinementList-item ais-RefinementList-item--selected">
          <label class="ais-RefinementList-label">
            <input class="ais-RefinementList-checkbox" type="checkbox" value="Insignia™" checked="" />
            <span class="ais-RefinementList-labelText">Insignia™</span>
            <span class="ais-RefinementList-count">746</span>
          </label>
        </li>
        <li class="ais-RefinementList-item">
          <label class="ais-RefinementList-label">
            <input class="ais-RefinementList-checkbox" type="checkbox" value="Samsung">
            <span class="ais-RefinementList-labelText">Samsung</span>
            <span class="ais-RefinementList-count">633</span>
          </label>
        </li>
      </ul>
      <button class="ais-RefinementList-showMore">Show more</button>
    </div>
    <div class="ais-RefinementList-footer ais-footer">
      Footer info
    </div>
  </div>
alt1: Show more disabled
althtml1: |
  <div class="ais-RefinementList">
    <div class="ais-RefinementList-header ais-header">
      Refinement list
    </div>
    <div class="ais-RefinementList-body ais-body">
      <div class="ais-RefinementList-searchBox">
        <!-- SearchBox widget here -->
      </div>
      <ul class="ais-RefinementList-list">
        <li class="ais-RefinementList-item ais-RefinementList-item--selected">
          <label class="ais-RefinementList-label">
            <input class="ais-RefinementList-checkbox" type="checkbox" value="Insignia™" checked="" />
            <span class="ais-RefinementList-labelText">Insignia™</span>
            <span class="ais-RefinementList-count">746</span>
          </label>
        </li>
        <li class="ais-RefinementList-item">
          <label class="ais-RefinementList-label">
            <input class="ais-RefinementList-checkbox" type="checkbox" value="Samsung">
            <span class="ais-RefinementList-labelText">Samsung</span>
            <span class="ais-RefinementList-count">633</span>
          </label>
        </li>
      </ul>
      <button class="ais-RefinementList-showMore ais-RefinementList-showMore--disabled" disabled>Show more</button>
    </div>
    <div class="ais-RefinementList-footer ais-footer">
      Footer info
    </div>
  </div>
classes:
  - name: .ais-RefinementList
    description: the root div of the widget
  - name: .ais-RefinementList-header
    description: the header of the widget (optional)
  - name: .ais-RefinementList-body
    description: the body of the widget
  - name: .ais-RefinementList-searchBox
    description: the search box of the widget
  - name: .ais-RefinementList-list
    description: the list of refinement items
  - name: .ais-RefinementList-item
    description: the refinement list item
  - name: .ais-RefinementList-item--selected
    description: the refinement selected list item
  - name: .ais-RefinementList-label
    description: the label of each refinement item
  - name: .ais-RefinementList-checkbox
    description: the checkbox input of each refinement item
  - name: .ais-RefinementList-labelText
    description: the label text of each refinement item
  - name: .ais-RefinementList-count
    description: the count of values for each item
  - name: .ais-RefinementList-showMore
    description: the button used to display more categories
  - name: .ais-RefinementList-showMore--disabled
    description: the disabled button used to display more categories
  - name: .ais-RefinementList-footer
    description: the footer of the widget (optional)
---
