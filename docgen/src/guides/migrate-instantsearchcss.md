---
title: Migrate widgets for v3
maintitle: guides
layout: main.pug
name: migratewidgets
category: guides
withheadings: true
navweight: 20
editable: true
githubsource: docgen/src/guides/migrate-instantsearchcss.md.md
---

This guide contains all the elements to update your widgets for the new markup and options of the widgets
in v3.

## Overview of the changes

### Renamed widgets

| In V2 | In V3 |
| ----- | ----- |


### Renamed parameters

| In V2 | In V3 |
| ----- | ----- |


## Widget – Breadcrumb

### Markup

```html
<div class="ais-Breadcrumb">
  <ul class="ais-Breadcrumb-list">
    <li class="ais-Breadcrumb-item">
      <a class="ais-Breadcrumb-link" href="#">Home</a>
    </li>
    <li class="ais-Breadcrumb-item">
      <span class="ais-Breadcrumb-separator" aria-hidden="true">></span>
      <a class="ais-Breadcrumb-link" href="#">Cooking</a>
    </li>
    <li class="ais-Breadcrumb-item ais-Breadcrumb-item--selected">
      <span class="ais-Breadcrumb-separator" aria-hidden="true">></span>
      Kitchen textiles
    </li>
  </ul>
</div>
```

The structure is now embeded in a list and each item wraps a separator and the link.

### Options

* The values for `classnames` has changed to reflect the markup update:
  * root
  * noRefinement (new)
  * list (new)
  * item (new)
  * selectedItem
  * separator
  * link

### CSS class names

| V2                            | V3 equivalent                        |
| ----------------------------- | ------------------------------------ |
| ais-breadcrumb--root          | ais-Breadcrumb                       |
| ais-breadcrumb--home          | _removed_ Use `:first-child` instead |
| ais-breadcrumb--label         | ais-Breadcrumb-link                  |
| ais-breadcrumb--disabledLabel | ais-Breadcrumb-item--selected        |
| ais-breadcrumb--separator     | ais-Breadcrumb-separator             |

<!-- Template -->

## Widget – old name

### Name change?

### Options

### Markup

### CSS
