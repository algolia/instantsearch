---
title: Tree Menu
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 6
editable: true
githubSource: docs/src/components/tree-menu.md
---

A component to add a tree menu in the form of a nested list of links.

Generally used to implement layered navigation.

## Usage

First, you need to ensure your data is structured correctly.
Here is an example of a valid record:

```json
{
    "name": "T-shirt",
    "lvl0": "Men's",
    "lvl1": "Men's > Summer"
}
```

Attributes `lvl0` and `lvl1` needs to be added as `attributesForFaceting`. You can do so by heading over to the Algolia dashboard of your index, and configuring the attributes for faceting under the `display` tab.

**Info:** The component can handle any amount of levels. You just need to make sure every attribute representing a level is correctly added to the `attributesForFaceting`.

In the record example above, you can see that every level contains the full path to the value.
The default delimiter used is ` > `. (surrounding spaces are important).


Basic usage:

```html
<ais-tree-menu :attributes="['lvl0', 'lvl1']"></ais-tree-menu>
```

## Props

| Name       | Type   | Default                                        | Description                                                                                                                           |
|------------|--------|------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------|
| attribute  | String | `tree-menu`                                    | The attribute name to refine on. This only needs to be changed if multiple tree-menu components are bound to the same search store |
| attributes | Array  |                                                | The attributes representing the different tree levels. They must be "facettable" in Algolia                                             |
| separator  | String | `' > '`                                        | The path delimiter                                                                                                                      |
| limit      | Number | `10`                                           | The number of values to display                                                                                                         |
| sort-by    | Array  | `['isRefined:desc', 'count:desc', 'name:asc']` | The sorting strategy                                                                                                                    |

## Slots

| Name    | Props                | Description                                                                                     |
|---------|----------------------|-------------------------------------------------------------------------------------------------|
| default | value, active, count | The text to display for a refinement value                                                      |
| header  |                      | Add content to the top of the component, which will be hidden when the component is hidden    |
| footer  |                      | Add content to the bottom of the component, which will be hidden when the component is hidden |

## CSS Classes

| ClassName                     | Description                 |
|-------------------------------|-----------------------------|
| `ais-tree-menu`               | Container class             |
| `ais-tree-menu__list`         | The root level list class   |
| `ais-tree-menu__item`         | A refinement option         |
| `ais-tree-menu__item--active` | An active refinement option |
| `ais-tree-menu__value`        | A refinement option value   |
| `ais-tree-menu__count`        | A refinement option count   |
