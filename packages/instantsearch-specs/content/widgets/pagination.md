---
title: Pagination
type: widget
html: |
  <div class="ais-Pagination">
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
classes:
  - name: .ais-Pagination
    description: the root div of the widget
  - name: .ais-Pagination--noRefinement
    description: the root div of the widget with no refinement
  - name: .ais-Pagination-list
    description: the list of all pagination items
  - name: .ais-Pagination-item
    description: the pagination list item
  - name: .ais-Pagination-item--firstPage
    description: the "first" pagination list item
  - name: .ais-Pagination-item--lastPage
    description: the "last" pagination list item
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
  - name: .ais-Pagination-link
    description: the pagination clickable element
options:
  - name: totalPages
    description: Maximum page to allow navigating to
  - name: padding
    default: 3
    description: amount of pages to show to the left and right of the current page
  - name: showFirst
    default: true
    description: Whether to show the "first page" control
  - name: showLast
    default: true
    description: Whether to show the "last page" control
  - name: showNext
    default: true
    description: Whether to show the "next page" control
  - name: showPrevious
    default: true
    description: Whether to show the "previous page" control
  - name: transformItems
  description: Function which receives the items, which will be called before displaying them. Should return a new array with the same shape as the original array. Useful for mapping over the items to transform, remove or reorder them
---
