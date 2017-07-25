---
title: Sort by selector
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 15
editable: true
githubSource: docs/docgen/src/components/sort-by-selector.md
---

A component that lets the user change the sorting by changing the index the search is operated on.

To be able to sort results with the Algolia engine, you need to have different indices.
To read more about sorting with Algolia, please checkout the [official documentation about sorting](https://www.algolia.com/doc/guides/relevance/sorting/#guides).

## Usage

Basic usage:

```html
<ais-sort-by-selector :indices="[
    {
      name: 'products',
      label: 'Default'
    },
    {
      name: 'products_price_asc',
      label: 'Cheapest'
    }
  ]"
/>
```

Customize the option rendering:

```html
<ais-sort-by-selector :indices="[
      {name: 'products', label: 'Most relevant'},
      {name: 'products_price_asc', label: 'Lowest price'},
      {name: 'products_total_sales', label: 'Popularity'}
    ]"
>
  <template scope="{ indexName, label }">
    <option :value="indexName">Sort by: {{ label }}</option>
  </template>
</ais-sort-by-selector>
```

## Props

| Name    | Required | Type  | Default | Description                                                          |
|:--------|:---------|:------|:--------|:---------------------------------------------------------------------|
| indices | true     | array | ``      | An array of objects, each one containing a `name` and a `label` key. |


## Slots

| Name    | Props            | Default                                                  | Description    |
|:--------|:-----------------|:---------------------------------------------------------|:---------------|
| default | indexName, label | `<option :value="index.name">{{ index.label }}</option>` | Select option. |

## CSS Classes

| ClassName            | Description             |
|:---------------------|:------------------------|
| ais-sort-by-selector | The select input class. |
