---
title: Pagination
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 7
editable: true
githubSource: docs/docgen/src/components/pagination.md
---

A component to navigate between results pages.

## Usage

Basic usage:

```html
<ais-pagination></ais-pagination>
```

Customize the number of pages to display around the active one:

```html
<ais-pagination :padding="5"></ais-pagination>
```

## Props

| Name    | Type   | Default | Description                                       |
|:--------|:-------|:--------|:--------------------------------------------------|
| padding | Number | `3`     | Number of pages to display around the active page |

## Slots

| Name     | Props        | Default                           | Description        |
|:---------|:-------------|:----------------------------------|:-------------------|
| first    |              | `&lt;&lt;`                        | First page text    |
| previous |              | `&lt;`                            | Previous page text |
| default  | active, item | {% raw %}`{{ item }}`{% endraw %} | Page text          |
| next     |              | `&gt;`                            | Next page text     |
| last     |              | `&gt;&gt;`                        | Last page text     |

## CSS Classes

| ClassName                      | Description        |
|:-------------------------------|:-------------------|
| ais-pagination                 | Container class    |
| ais-pagination__item           | Page link item     |
| ais-pagination__item--first    | First link item    |
| ais-pagination__item--previous | Previous link item |
| ais-pagination__item--next     | Next link item     |
| ais-pagination__item--last     | Last link item     |
