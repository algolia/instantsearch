---
title: Internationalization
layout: guide.pug
nav_groups:
  - core
nav_sort: 3
---

All widgets rendering text that is not otherwise configurable via props accept a `translations` prop. This prop is a mapping of keys to translation values. Translation values can be either a `String` or a `Function`, as some take parameters. The different translation keys supported by components and their optional parameters are described on their respective documentation page.

### Example: Translating a Pagination

```
import {Pagination} from 'react-instantsearch';

function TranslatedPagination(props) {
  return (
    <Pagination
      translations={{
        previous: 'Previous',
        next: 'Next',
        first: 'First',
        last: 'Last',
        page: page => (page + 1).toLocaleString(),
        ariaPrevious: 'Previous page',
        ariaNext: 'Next page',
        ariaFirst: 'First page',
        ariaLast: 'Last page',
        ariaPage: page => `Page ${(page + 1).toLocaleString()}`,
      }}
    />
  );
}
```
