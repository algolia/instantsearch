---
title: Pagination
layout: api.ejs
nav_groups:
  - widgets
---

# Pagination

Displays a list of page links for navigating the results set.

There's also a `PaginationSelect` which renders a select control.

## Pagination Props

<!-- props default ./index.js -->

## Pagination.Select Props

<!-- props default.Select ./index.js -->

### Theme

`root`

Only for `Pagination`: `item`, `itemFirst`, `itemLast`, `itemPrevious`, `itemNext`, `itemPage`, `itemSelected`, `itemDisabled`, `itemLink`

### Translations

`page(n)`

Only for `Pagination`: `previous`, `next`, `first`, `last`, `ariaPrevious`, `ariaNext`, `ariaFirst`, `ariaLast`, `ariaPage(n)`

## Implementing your own Pagination

See [Making your own widgets](../Customization.md) for more information on how to use the `Pagination.connect` HOC.

```
import {Pagination} from 'react-instantsearch';

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
