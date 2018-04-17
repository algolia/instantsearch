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

Create a menu based on a facet. A menu displays a list of facet values and let the user selects only one value at a time.

<a class="btn btn-static-theme" href="stories/?selectedKind=Menu">🕹 try out live</a>

## Usage

```html
<ais-menu :attribute="category"></ais-menu>
```

## Props

Name | Type | Default | Description | Required
---|---|---|---|---
attribute | String | | The attribute | yes
limit | Number | 10 | Number of items to show
showMoreLimit | Number | 20 | Number of items to show when the user clicked on "show more items"
showMore | Boolean | `false` | Whether or not to have the option to load more values
sortBy | Array(string) or function | `['isRefined:desc', 'count:desc', 'name:asc']` | array or function to sort the results by

## CSS classes

Here's a list of CSS classes exposed by this widget. To better understand the underlying
DOM structure, have a look at the generated DOM in your browser.

Class name | Description
---|---
`.ais-Menu` | the root div of the widget
`.ais-Menu--noRefinement` | the root div of the widget with no refinement
`.ais-Menu-searchBox` | the search box of the widget
`.ais-Menu-list` | the list of all menu items
`.ais-Menu-item` | the menu list item
`.ais-Menu-item--selected` | the selected menu list item
`.ais-Menu-link` | the clickable menu element
`.ais-Menu-label` | the label of each item
`.ais-Menu-count` | the count of values for each item
`.ais-Menu-noResults` | the div displayed when there are no results
`.ais-Menu-showMore` | the button used to display more categories
`.ais-Menu-showMore--disabled` | the disabled button used to display more categories
