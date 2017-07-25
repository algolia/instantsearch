---
title: Rating
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 16
editable: true
githubSource: docs/docgen/src/components/rating.md
---

A component to filter results based on a rating.

## Usage

Basic usage:

```html
<ais-rating :attribute-name="rating"></ais-rating>
```

Custom boundaries:

```html
<ais-rating :attribute-name="score" :max="10"></ais-rating>
```

## Props

| Name           | Type   | Default | Description                     |
|:---------------|:-------|:--------|:--------------------------------|
| attribute-name | String |         | The attribute name to refine on |
| min            | Number | `1`     | Apply operator on refinement    |
| max            | Number | `5`     | The number of values to display |

## Slots

| Name    | Props                  | Description                                                                                     |
|:--------|:-----------------------|:------------------------------------------------------------------------------------------------|
| default | value, min, max, count | The refinement options                                                                          |
| header  |                        | Allows to add content at the top of the component which will be hidden when the component is    |
| clear   |                        | Clear the active rating refinement                                                              |
| footer  |                        | Allows to add content at the bottom of the component which will be hidden when the component is |

## CSS Classes

| ClassName                | Description                 |
|:-------------------------|:----------------------------|
| ais-rating               | Container class             |
| ais-rating__clear        | The clear button text       |
| ais-rating__item         | A refinement option         |
| ais-rating__item--active | An active refinement option |
| ais-rating__value        | A refinement option value   |
| ais-rating__count        | A refinement option count   |
| ais-rating__star         | A star                      |
| ais-rating__star--empty  | An empty star               |
