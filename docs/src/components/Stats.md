---
title: Stats
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 11
editable: true
githubSource: docs/src/components/Stats.md
---

A component that displays the total number of results found and the processing time in milliseconds.

<a class="btn btn-static-theme" href="stories/?selectedKind=Stats">🕹 try out live</a>

## Usage

Basic usage:

```html
<ais-stats></ais-stats>
```

Custom text:

```html
<ais-stats>
  <template slot-scope="{ hitsPerPage, nbPages, nbHits, page, processingTimeMS, query }">
    There are {{ nbHits }} matching your query: <b>{{ query }}</b>
    - <small>{{ processingTimeMS }}ms</small>
  </template>
</ais-stats>
```

## Props

Name | Type | Default | Description | Required
---|---|---|---|---
classNames | Object | | Override class names | no

## Slots

> TODO: update to follow convention

| Name    | Props                               | Default                                                        | Description        |
|:--------|:------------------------------------|:---------------------------------------------------------------|:-------------------|
| default | hitsPerPage, nbPages, nbHits, page, processingTimeMS, query | `'{{ nbHits }} results found in {{ processingTimeMS }}ms'` | The text displayed |


## CSS Classes

| ClassName   | Description     |
|:------------|:----------------|
| `ais-stats` | Container class |
| `ais-stats-text` | Message container |
