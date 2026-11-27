---
layout: ../../layouts/WidgetLayout.astro
title: Pagination
type: widget
html: |
  <div class="ais-Pagination">
    <ul class="ais-Pagination-list">
      <li class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--firstPage">
        <span class="ais-Pagination-link" aria-label="First Page">‹‹</span>
      </li>
      <li class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--previousPage">
        <span class="ais-Pagination-link" aria-label="Previous Page">‹</span>
      </li>
      <li class="ais-Pagination-item ais-Pagination-item--page ais-Pagination-item--selected">
        <a class="ais-Pagination-link" aria-label="Page 1" aria-current="page" href="#">1</a>
      </li>
      <li class="ais-Pagination-item ais-Pagination-item--page">
        <a class="ais-Pagination-link" aria-label="Page 2" href="#">2</a>
      </li>
      <li class="ais-Pagination-item ais-Pagination-item--page">
        <a class="ais-Pagination-link" aria-label="Page 3" href="#">3</a>
      </li>
      <li class="ais-Pagination-item ais-Pagination-item--page">
        <a class="ais-Pagination-link" aria-label="Page 4" href="#">4</a>
      </li>
      <li class="ais-Pagination-item ais-Pagination-item--nextPage">
        <a class="ais-Pagination-link" aria-label="Next Page" href="#">›</a>
      </li>
      <li class="ais-Pagination-item ais-Pagination-item--lastPage">
        <a class="ais-Pagination-link" aria-label="Last Page, Page 4" href="#">››</a>
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
translations:
  - name: firstPageItemText
    default: '"‹‹"'
    description: The text for the first page item.
  - name: previousPageItemText
    default: '"‹"'
    description: The text for the previous page item.
  - name: nextPageItemText
    default: '"›"'
    description: The text for the next page item.
  - name: lastPageItemText
    default: '"››"'
    description: The text for the last page item.
  - name: pageItemText
    default: '({ currentPage, nbPages }) => String(currentPage)'
    description: The text for the current page item.
  - name: firstPageItemAriaLabel
    default: '"First Page"'
    description: The label for the first page item (for screen readers).
  - name: previousPageItemAriaLabel
    default: '"Previous Page"'
    description: The label for the previous page item (for screen readers).
  - name: nextPageItemAriaLabel
    default: '"Next Page"'
    description: The label for the next page item (for screen readers).
  - name: lastPageItemAriaLabel
    default: '`Last Page, Page ${nbPages}`'
    description: The label for the last page item (for screen readers).
  - name: pageItemAriaLabel
    default: '({ currentPage, nbPages }) => `Page ${currentPage}`'
    description: The label for each page item (for screen readers).
---
