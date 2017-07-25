---
title: Refinement list
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 6
editable: true
githubSource: docs/docgen/src/components/refinement-list.md
---

A component to add facet refinements in the form of a list of checkboxes.

## Usage

Basic usage:

```html
<ais-refinement-list attribute-name="brand"></ais-refinement-list>
```

## Props

| Name           | Type              | Default                                        | Description                                    |
|:---------------|:------------------|:-----------------------------------------------|:-----------------------------------------------|
| attribute-name | String            |                                                | The attribute name to refine on                |
| operator       | `'and'` or `'or'` | `'or'`                                         | Apply operator on refinement                   |
| limit          | Number            | `10`                                           | The number of values to display                |
| sort-by        | Array             | `['isRefined:desc', 'count:desc', 'name:asc']` | The sorting strategy for the refinement values |

## Slots

| Name    | Props                | Description                                                                                     |
|:--------|:---------------------|:------------------------------------------------------------------------------------------------|
| default | value, active, count | The text to display for a refinement value                                                      |
| header  |                      | Allows to add content at the top of the component which will be hidden when the component is    |
| footer  |                      | Allows to add content at the bottom of the component which will be hidden when the component is |

## CSS Classes

| ClassName                         | Description                 |
|:----------------------------------|:----------------------------|
| ais-refinement-list               | Container class             |
| ais-refinement-list__item         | A refinement option         |
| ais-refinement-list__item--active | An active refinement option |
| ais-refinement-list__value        | A refinement option value   |
| ais-refinement-list__count        | A refinement option count   |
