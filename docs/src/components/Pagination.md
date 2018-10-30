---
title: Pagination
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 7
editable: true
githubSource: docs/src/components/Pagination.md
---

A component to navigate between different pages of results.

<a class="btn btn-static-theme" href="stories/?selectedKind=Pagination">🕹 try out live</a>

## Usage

```html
<ais-pagination :padding="3"></ais-pagination>
```

## Props

Name | Type | | Default | Description | Required
---|---|---|---|---
padding | Number | `3` | the amount of pages to show before and after the current page | no
totalPages | Number | | Limit the amount of pages that can be reached | no
showFirst | Boolean | `true` | Show the "first page" button | no
showLast | Boolean | `true` | Show the "last page" button | no
showNext | Boolean | `true` | Show the "next page" button | no
showPrevious | Boolean | `true` | Show the "previous page" button | no
class-names | Object | `{}` | Override class names | no

## Slots

Name | Scope | Description
---|---|---
default | `{ refine: (Number) => void, createURL: () => String, currentRefinement: Number, nbHits: Number, nbPages: Number, pages: Number, isFirstPage: Boolean, isLastPage: Boolean }` | Slot to override the DOM output


## CSS classes

Here's a list of CSS classes exposed by this widget. To better understand the underlying
DOM structure, have a look at the generated DOM in your browser.

Note that you can pass the prop `class-names`, with an object of class names and their replacement to override this.

Class name | Description
---|---
`.ais-Pagination` | the root div of the widget
`.ais-Pagination--noRefinement` | the root div of the widget with no refinement
`.ais-Pagination-list` | the list of all pagination items
`.ais-Pagination-item` | the pagination list item
`.ais-Pagination-item--firstPage` | the "first" pagination list item
`.ais-Pagination-item--lastPage` | the "last" pagination list item
`.ais-Pagination-item--previousPage` | the "previous" pagination list item
`.ais-Pagination-item--nextPage` | the "next" pagination list item
`.ais-Pagination-item--item` | the "page" pagination list item
`.ais-Pagination-item--selected` | the selected pagination list item
`.ais-Pagination-item--disabled` | the disabled pagination list item
`.ais-Pagination-link` | the pagination clickable element

## Events

Event name | Variables | Description
---|---|---
page-change | page | Triggered right after a page was changed due to an action taken on the pagination component.
