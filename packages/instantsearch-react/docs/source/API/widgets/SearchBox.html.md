---
title: SearchBox
layout: api
---

# `SearchBox`

## Props

- `searchAsYouType` (boolean, default = `true`): When `true`, will search after every keystroke.
When `false`, will only search when input is submitted.
- `focusShortcuts` (string[], default = `['s', '/']`): When input is blurred, defines which key will trigger a focus.
- `autoFocus` (boolean, default = `true`): Should the input be auto focused by default
- `[translations](#translations)`
- `[theme](#theme)`

## Examples

```js
import {InstantSearch, SearchBox, Hits} from 'instantsearch-react';

<InstantSearch
  appId="latency"
  apiKey="6be0576ff61c053d5f9a3225e2a90f76"
  indexName="instant_search"
>
  <div>
    <SearchBox />
    <Hits />
  </div>
</InstantSearch>
```

## Translations

- submit
- reset
- submitTitle
- resetTitle
- placeholder

## Theme

- root
- wrapper
- input
- submit
- reset
