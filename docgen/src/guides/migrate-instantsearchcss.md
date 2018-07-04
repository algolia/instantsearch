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

| In V2    | In V3            |
| -------- | ---------------- |
| clearAll | clearRefinements |

### Renamed connectors

| In V2           | In V3                   |
| --------------- | ----------------------- |
| connectClearAll | connectClearRefinements |

### Renamed parameters

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

* The values for `cssClasses` has changed to reflect the markup update:
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

## Widget – clearAll

### Name update

The `clearAll` widget has been renamed into `clearRefinements`. In order to initialize it, you need to update name in your code:

```js
search.addWidget(
  instantsearch.widgets.clearRefinements({
    /* options here */
  })
);
```

### Markup

```html
<div class="ais-ClearRefinements">
  <button class="ais-ClearRefinements-button">
    Clear refinements
  </button>
</div>
```

### Options

Options that were renamed (same semantic):

* `excludeAttributes` → `excludedAttributes`

Values for `cssClasses` have been updated to reflect the markup changes:

* root
* button
* disabledButton

Note that `button` and `disabledButton` are independant. If the button enters the disable state, then both classes will be applied.

CSS classes and templates for autohideContainer, header, footer and body have been moved to an external widget wrapper: panel.

### CSS

| V2                    | V3 equivalent                                 |
| --------------------- | --------------------------------------------- |
| ais-clear-all--root   | ais-ClearRefinements                          |
| ais-clear-all--link   | ais-ClearRefinements-button                   |
| ais-clear-all--body   | _removed_ handled by the panel widget wrapper |
| ais-clear-all--header | _removed_ handled by the panel widget wrapper |
| ais-clear-all--footer | _removed_ handled by the panel widget wrapper |

## Connector - connectClearAll

### Name update

The connector `connectClearAll` has been renamed into `connectClearRefinements`.

### Options

<!-- Template -->

## Widget – old name

### Name update?

### Options

### Markup

### CSS

## Connector – old name

### Name update

### Options
