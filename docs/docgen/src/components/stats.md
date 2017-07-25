---
title: Stats
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 11
editable: true
githubSource: docs/docgen/src/components/stats.md
---

A component that displays the total number of results found and the processing time in milliseconds.

## Usage

Basic usage:

```html
<ais-stats />
```

Custom text:

```html
<ais-stats>
  <template scope="{ totalResults, processingTime, query }">
    There are {{ totalResults }} matching your query: <b>{{ query }}</b>
    - <small>{{ processingTime }}ms</small>
  </template>
</ais-stats>
```

## Slots

| Name    | Props                               | Default                                                        | Description        |
|:--------|:------------------------------------|:---------------------------------------------------------------|:-------------------|
| default | totalResults, processingTime, query | `'{{ totalResults }} results found in {{ processingTime }}ms'` | The text displayed |


## CSS Classes

| ClassName | Description     |
|:----------|:----------------|
| ais-stats | Container class |
