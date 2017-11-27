---
title: Pagination
type: widget
html: |
  <div class="ais-Pagination">
    <div class="ais-Pagination-header ais-header">
      Pagination
    </div>
    <div class="ais-Pagination-body ais-body">
      <ul class="ais-Pagination-list">
        <li class="ais-Pagination-item ais-Pagination-item--firstPage ais-Pagination-item--disabled">
          <span class="ais-Pagination-link" aria-label="Previous">‹‹</span>
        </li>
        <li class="ais-Pagination-item ais-Pagination-item--previousPage ais-Pagination-item--disabled">
          <span class="ais-Pagination-link" aria-label="Previous">‹</span>
        </li>
        <li class="ais-Pagination-item ais-Pagination-item--selected">
          <a class="ais-Pagination-link" href="#">1</a>
        </li>
        <li class="ais-Pagination-item ais-Pagination-item--page">
          <a class="ais-Pagination-link" href="#">2</a>
        </li>
        <li class="ais-Pagination-item ais-Pagination-item--page">
          <a class="ais-Pagination-link" href="#">3</a>
        </li>
        <li class="ais-Pagination-item">
          <a class="ais-Pagination-link" href="#">4</a>
        </li>
        <li class="ais-Pagination-item ais-Pagination-item--nextPage">
          <a class="ais-Pagination-link" aria-label="Next" href="#">›</a>
        </li>
        <li class="ais-Pagination-item ais-Pagination-item--lastPage">
          <a class="ais-Pagination-link" aria-label="Next" href="#">››</a>
        </li>
      </ul>
    </div>
    <div class="ais-Pagination-footer ais-footer">
      Footer info
    </div>
  </div>
classes:
  - name: .ais-Pagination
    description: the root div of the widget
  - name: .ais-Pagination-header
    description: the header of the widget (optional)
  - name: .ais-Pagination-body
    description: the body of the widget
  - name: .ais-Pagination-list
    description: the list of all pagination items
  - name: .ais-Pagination-item
    description: the pagination list item
  - name: .ais-Pagination-item--previousPage
    description: the "previous" pagination list item
  - name: .ais-Pagination-item--nextPage
    description: the "next" pagination list item
  - name: .ais-Pagination-item--page
    description: the "page" pagination list item
  - name: .ais-Pagination-item--selected
    description: the selected pagination list item
  - name: .ais-Pagination-item--disabled
    description: the disabled pagination list item
  - name: .ais-Pagination-item--link
    description: the pagination clickable element
  - name: .ais-Pagination-footer
    description: the footer of the widget (optional)
---
