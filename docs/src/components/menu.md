---
title: Menu
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 6
editable: true
githubSource: docs/src/components/menu.md
---

Create a menu based on a facet. A menu displays facet values and let the user selects only one value at a time. It also displays an empty value which lets the user “unselect” any previous selection.

<a class="btn btn-static-theme" href="stories/?selectedKind=Menu">🕹 try out live</a>

## Usage

```html
<ais-menu :attribute="category"></ais-menu>
```

## Props

| Name      | Type   | Default                                        | Description                      |
|-----------|--------|------------------------------------------------|----------------------------------|
| attribute | String |                                                | The attribute name to refine on. |
| limit     | Number | `10`                                           | The number of values to display  |
| sort-by   | Array  | `['isRefined:desc', 'count:desc', 'name:asc']` | The sorting strategy             |

## Slots

| Name   | Props | Description                                                                                   |
|--------|-------|-----------------------------------------------------------------------------------------------|
| header |       | Add content to the top of the component, which will be hidden when the component is hidden    |
| footer |       | Add content to the bottom of the component, which will be hidden when the component is hidden |

## CSS Classes

| ClassName                | Description                 |
|--------------------------|-----------------------------|
| `ais-menu`               | Container class             |
| `ais-menu__item`         | A refinement option         |
| `ais-menu__item--active` | An active refinement option |
| `ais-menu__count`        | A refinement option count   |
