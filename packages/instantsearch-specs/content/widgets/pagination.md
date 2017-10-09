---
title: Pagination
type: widget
html: |
  <div class="ais-Pagination">
    <div class="ais-Pagination-header ais-header">
      Header (optional)
    </div>
    <div class="ais-Pagination-body ais-body">
      <ul class="ais-Pagination-list">
        <li class="ais-Pagination-item ais-Pagination-item--previous">
          <a class="ais-Pagination-link" aria-label="Previous" href="some-link">‹</a>
        </li>
        <li class="ais-Pagination-item ais-Pagination-item--page ais-Pagination-item--selected">
          <a class="ais-Pagination-link" href="some-link">1</a>
        </li>
        <li class="ais-Pagination-item ais-Pagination-item--page">
          <a class="ais-Pagination-link" href="some-link">2</a>
        </li>
        <li class="ais-Pagination-item ais-Pagination-item--next">
          <a class="ais-Pagination-link" aria-label="Next" href="some-link">›</a>
        </li>
      </ul>
    </div>
    <div class="ais-Pagination-footer ais-footer">
      Footer (optional)
    </div>
  </div>
classes:
  - name: .ais-Pagination
    description: the root div of the widget
  - name: .ais-Pagination-header
    description: the header of the widget
  - name: .ais-Pagination-body
    description: the body of the widget
  - name: .ais-Pagination-list
    description: the list of all pagination items
  - name: .ais-Pagination-item
    description: the pagination list item
  - name: .ais-Pagination-item--previous
    description: the "previous" pagination list item
  - name: .ais-Pagination-item--next
    description: the "next" pagination list item
  - name: .ais-Pagination-item--page
    description: the "page" pagination list item
  - name: .ais-Pagination-item--selected
    description: the selected pagination list item
  - name: .ais-Pagination-item--link
    description: the pagination clickable element
  - name: .ais-Pagination-footer
    description: the footer of the widget
---
