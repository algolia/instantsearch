---
title: Menu
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 6
editable: true
githubSource: docs/src/components/Menu.md
---

Create a menu based on a facet. A menu displays a list of facet values and let the user selects only one value at a time. Make sure that the attribute you used is in `attributesForFaceting`.

<a class="btn btn-static-theme" href="stories/?selectedKind=Menu">🕹 try out live</a>

## Usage

```html
<ais-menu :attribute="category"></ais-menu>
```

## Props

Name | Type | Default | Description | Required
---|---|---|---|---
attribute | string | - | The attribute | Yes
limit | number | 10 | Number of items to show | -
showMoreLimit | number | 20 | Number of items to show when the user clicked on "show more" | -
showMore | boolean | `false` | Whether or not to have the option to load more values | -
sortBy | string[] or function | `['name:asc', 'count:desc']` | Array or function to sort the results by | -
transformItems | `(items: object[]) => object[]` | `x => x` | Function which receives the items, which will be called before displaying them. Should return a new array with the same shape as the original array. Useful for mapping over the items to transform, remove or reorder them | -
class-names | Object | `{}` | Override class names | no

## Slots

Name | Scope | Description
---|---|---
default | `{ items: Array<{label: String, value: String}>, canRefine: Boolean, canToggleShowMore: Boolean, isShowingMore: Boolean, refine: String => void, createURL: () => String, toggleShowMore: () => void, }` | Slot to override the DOM output
showMoreLabel | `{ isShowingMore: Boolean }` | Slot to label when show-more is enabled.

## CSS classes

Here's a list of CSS classes exposed by this widget. To better understand the underlying DOM structure, have a look at the generated DOM in your browser.

Note that you can pass the prop `class-names`, with an object of class names and their replacement to override this.

Class name | Description
---|---
`.ais-Menu` | the root div of the widget
`.ais-Menu--noRefinement` | the root div of the widget with no refinement
`.ais-Menu-list` | the list of all menu items
`.ais-Menu-item` | the menu list item
`.ais-Menu-item--selected` | the selected menu list item
`.ais-Menu-link` | the clickable menu element
`.ais-Menu-label` | the label of each item
`.ais-Menu-count` | the count of values for each item
`.ais-Menu-showMore` | the button used to display more categories
`.ais-Menu-showMore--disabled` | the disabled button used to display more categories
