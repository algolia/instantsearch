---
title: Sort by selector
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 15
editable: true
githubSource: docs/src/components/SortBy.md
---

A component that lets the user change the sorting by changing the index the search is operated on.

To be able to sort results with the Algolia engine, you need to have different indices. To read more about sorting with Algolia, please checkout the [official documentation about sorting](https://www.algolia.com/doc/guides/relevance/sorting/#guides).

<a class="btn btn-static-theme" href="stories/?selectedKind=SortBy">🕹 try out live</a>

## Usage

Basic usage:

```html
<ais-sort-by :items="[
    {
      value: 'products',
      label: 'Default'
    },
    {
      value: 'products_price_asc',
      label: 'Cheapest'
    }
  ]"
/>
```

Customize the rendering:

```html
<ais-sort-by :items="[
      {value: 'products', label: 'Most relevant'},
      {value: 'products_price_asc', label: 'Lowest price'},
      {value: 'products_total_sales', label: 'Popularity'}
    ]"
>
  <select
    slot-scope="{ items, refine, currentRefinement, hasNoResults }"
    @change="refine($event.currentTarget.value)"
  >
    <option
      v-for="item in items"
      :key="item.value"
      :value="item.value"
      :selected="item.value === currentRefinement"
    >
      {{item.label}}
    </option>
  </select>
</ais-sort-by>
```

## Props

Name | Type | Default | Description | Required
---|---|---|---|---
items | Array |  | An array of objects, each one containing a `value` and a `label` key. | yes
transformItems | `(items: object[]) => object[]` | `x => x` | Function which receives the items, which will be called before displaying them. Should return a new array with the same shape as the original array. Useful for mapping over the items to transform, remove or reorder them | -
classNames | Object | | Override class names | no

## Slots

Name | Scope | Description
---|---|---
default | `{ items: Array<{ label: String, value: String }>, hasNoResults: Boolean,, refine: String => void, currentRefinement: String }` | Slot to override the DOM output

## CSS classes

Here's a list of CSS classes exposed by this widget. To better understand the underlying DOM structure, have a look at the generated DOM in your browser.

Note that you can pass the prop `class-names`, with an object of class names and their replacement to override this.

Class name | Description
---|---
`ais-SortBy` | the root div of the widget
`ais-SortBy-select` | The `<select>` element
`ais-SortBy-option` | An `<option>` of the selection
