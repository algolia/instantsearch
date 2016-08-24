---
title: Pagination
layout: api.ejs
nav_groups:
  - widgets
---

# Pagination

Displays a list of page links for navigating the results set.

There's also a `PaginationSelect` which renders a select control.

## Props

Name | Type | Default |Description
:- | :- | :- | :-
`id` | `?string` | `p` | URL state serialization key. The state of this widget takes the shape of a `number`.
`pagesPadding` | `?number` | `3` | How many page links to display around the current page
`maxPages` | `?number` | `Infinity` | Maximum number of pages to display

#### Only for `Pagination`:

Name | Type | Default |Description
:- | :- | :- | :-
`showFirst` | `?bool` | `true` | Display the first page link
`showPrevious` | `?bool` | `true` | Display the previous page link
`showNext` | `?bool` | `true` | Display the next page link
`showLast` | `?bool` | `false` | Display the last page link

### Theme

`root`

Only for `Pagination`: `item`, `itemFirst`, `itemLast`, `itemPrevious`, `itemNext`, `itemPage`, `itemSelected`, `itemDisabled`, `itemLink`

### Translations

`page(n)`

Only for `Pagination`: `previous`, `next`, `first`, `last`, `ariaPrevious`, `ariaNext`, `ariaFirst`, `ariaLast`, `ariaPage(n)`

## Implementing your own Pagination

See [Making your own widgets](../Customization.md) for more information on how to use the `Pagination.connect` HOC.

```
import {Pagination} from 'instantsearch-react';

function MyPagination(props) {
  return (
    <div>
      <p>The current page is {props.page}.</p>
      <p>The total number of page is {props.nbPages}.</p>
      <a
        onClick={e => {
          e.preventDefault();
          props.refine(props.page - 1);
        }}
        href={props.createURL(props.page - 1)}
      >
        Previous page
      </a>
      <a
        onClick={e => {
          e.preventDefault();
          props.refine(props.page + 1);
        }}
        href={props.createURL(props.page + 1)}
      >
        Next page
      </a>
    </div>
  );
}

// `Pagination.connect` accepts the same `id` prop as `Pagination`.
export default Pagination.connect(MyPagination);
```
