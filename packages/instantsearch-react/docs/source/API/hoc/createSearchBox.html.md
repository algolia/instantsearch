---
title: createSearchBox
layout: api
---

# `createSearchBox`

## Forwarded props

- `refine` (function): when called, will set the query
- `query` (string): contains the current query

## Examples

```js
import {InstantSearch, createSearchBox, Hits} from 'instantsearch-react';

const CustomSearchBoxImplem = ({refine}) =>
  <input
    type="text"
    onChange={e => refine(e.target.value)}
  />;

const CustomSearchBox = createSearchBox(CustomSearchBoxImplem);

<InstantSearch
  appId="latency"
  apiKey="6be0576ff61c053d5f9a3225e2a90f76"
  indexName="instant_search"
>
  <div>
    <CustomSearchBox />
    <Hits />
  </div>
</InstantSearch>
```
