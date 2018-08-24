---
title: Styling
mainTitle: Essentials
layout: main.pug
category: Getting started
withHeadings: true
navWeight: 7
editable: true
githubSource: docs/src/getting-started/styling.md
---

Vue InstantSearch does not come with any styling but makes sure you can adapt the look & feel to your existing design.

Here you will learn about the available options.

## HTML Classes

Vue InstantSearch assigns one or multiple class names to most of the HTML tags rendered by the components.

Class names follow the BEM syntax `${block}__${element}--${modifier}`. 
All class names are prefixed with the `ais-` string to avoid any conflict with existing class names.
`ais` stands for "Algolia Instant-Search".

For example, `ais-pagination__item` represents a single page element inside the `Pagination component`.
If that page is also the current page, the element will also have the same class name suffixed with the `active` modifier: `ais-pagination__item--active`.

It is up to you to take advantage of existing class names to make the search experience fit into your existing layout.

All class names are listed on the dedicated documentation page of every component.

## Overriding class names

You can override existing class names with your own ones.

To do so, you need to provide an object as the `class-names` property, which will map default class names to the ones of your choice.

For example:

```html
<ais-pagination :class-names="{
  'ais-pagination': 'pagination',
  'ais-pagination__item': 'page',
  'ais-pagination__item--active': 'active',
}">
</ais-pagination>
```

This will replace custom classes where applicable, while leaving untouched the rest of the class names.

## Using slots

By using slots, you can customize the HTML of a given section of a component.

Slots come in two flavors, simple `slots` and `scoped slots`.

`scoped slots` will provide your template with an access to some contextual information, whereas simple `slots` will not.

Here is an example of adding a header to a `RefinementList` component:

```html
<ais-refinement-list attribute="brand">
  <h3 slot="header">Filter by Brand</h3>
</ais-refinement-list>
```

When you use a `scoped slot`, you need to tell your template to get the scope.

```html
<ais-results>
  <template slot-scope="{ result }">
    <h2>{{ result.name }}</h2>
  </template>
</ais-results>
```

A list of available slots is available on each component's dedicated documentation page. Those pages also mention the available `scope properties` in case of `scoped slot`.

## Overriding templates with `inline-template`

Sometimes, slots are not sufficient to adapt the HTML structure to your needs.

In that case, you can replace the entire template of a component.

**Hint:** To do so we recommend you always copy the existing template.

You can tell Vue.js to override the template by specifying an `inline-template` attribute on a component.

For example, render results in a `table` instead of in `<div>`s

```html
<ais-results inline-template>
  <table>
    <tbody>
      <tr v-for="result in results" :key="result.objectID">
        <td>{{ result.name }}</td>
        <td>{{ result.description }}</td>
      </tr>
    </tbody>
  </table>
</ais-results>
```

It is recommended to not overuse this `inline-template` feature because it makes it hard to know about the current scope. In the previous example, the `results` variable is provided by the `Results` component, not the current scope.

As an alternative to using an `inline-template`, you can extend an existing component.

## Extending a component

By extending a component, you can override its default template. 
You can also customize the behavior of the component, but that is out of the scope of this section.

Here is how you could implement a `TableResults.vue` component that would display results in a table instead of in `div`s.


```vue
<template>
  <table>
    <tbody>
      <tr v-for="result in results" :key="result.objectID">
        <td>{{ result.name }}</td>
        <td>{{ result.description }}</td>
      </tr>
    </tbody>
  </table>
</template>
<script>
import { Results } from 'vue-instantsearch';

export default {
  extends: Results,
}
</script>
```

You can now use that component in your application:

```vue
<template>
  <ais-index app-id="<app-id>" api-key="<api-key>" index-name="<index-name>">
    <table-results></table-results>
  </ais-index>
</template>
<script>
import TableResults from './TableResults.vue';
export default {
  components: [TableResults],
}
</script>
```






