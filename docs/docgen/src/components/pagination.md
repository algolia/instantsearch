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

Scroll to the top of the page after a page was changed:

```vue
<template>
    <!-- ... -->
    <ais-pagination v-on:page-change="onPageChange"></ais-pagination>
    <!-- ... -->
</template>
<script>
  export default {
    methods: {
      onPageChange() {
        window.scrollTo(0,0);
      }
    }
  }
</script>
```

## Props

| Name    | Type   | Default | Description                                       |
|---------|--------|---------|---------------------------------------------------|
| padding | Number | `3`     | Number of pages to display around the active page |

## Slots

| Name     | Props        | Default      | Description        |
|----------|--------------|--------------|--------------------|
| first    |              | `<<`         | First page text    |
| previous |              | `<`          | Previous page text |
| default  | active, item | `{{ item }}` | Page text          |
| next     |              | `>`          | Next page text     |
| last     |              | `>>`         | Last page text     |

## CSS Classes

| ClassName                      | Description        |
|--------------------------------|--------------------|
| ais-pagination                 | Container class    |
| ais-pagination__item           | Page link item     |
| ais-pagination__item--first    | First link item    |
| ais-pagination__item--previous | Previous link item |
| ais-pagination__item--next     | Next link item     |
| ais-pagination__item--last     | Last link item     |

## Events

| Event name  | Description                                                                                  |
|-------------|----------------------------------------------------------------------------------------------|
| page-change | Triggered right after a page was changed due to an action taken on the pagination component. |
