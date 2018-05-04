---
title: MenuSelect
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 6
editable: true
githubSource: docs/src/components/MenuSelect.md
---

Create a menu based on a facet with a `select` element.

<a class="btn btn-static-theme" href="stories/?selectedKind=MenuSelect">🕹 try out live</a>

## Usage

```html
<ais-menu-select :attribute="facetName"></ais-menu-select>
```

## Props

Name | Type | Default | Description | Required
---|---|---|---|---
attribute | `string` | | Name of the attribute for faceting. | yes
limit | `number` | `10` | How many facets values to retrieve. | no
sortBy | `string[]|function` | `['name:asc']` | How to sort refinements. Possible values: `count`, `isRefined`, `name:asc`, `name:desc`. You can also use a sort function that behaves like the standard JavaScript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax). | no

## CSS classes

Here's a list of CSS classes exposed by this widget. To better understand the underlying
DOM structure, have a look at the generated DOM in your browser.

Class name | Description
---|---
`ais-MenuSelect` | The root div of the widget
`ais-MenuSelect--noRefinement	` | The root div of the widget with no refinement
`ais-MenuSelect-select` | The select
`ais-MenuSelect-option` | The select option
