---
title: Search Box
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 3
editable: true
githubSource: docs/src/components/SearchBox.md
---

A search input with a clear and submit button.

<a class="btn btn-static-theme" href="stories/?selectedKind=SearchBox">🕹 try out live</a>

## Usage

```html
<ais-search-box placeholder="Find products..."></ais-search-box>
```

## Props

Name | Type | Default | Description | Required
---|---|---|---|---
placeholder | String | `'Search here…'` | The input placeholder | no
submit-title | String | `'search'` | The submit button text | no
clear-title | String | `'clear'` | The clear button text | no
autofocus | Boolean | `false` | Whether to automatically focus on the input when rendered | no
show-loading-indicator | Boolean | `false` | Show a spinner in the search box if a delay is passed and no results are returned yet | no
classNames | Object | | Override class names | no

## CSS classes

Here's a list of CSS classes exposed by this widget. To better understand the underlying
DOM structure, have a look at the generated DOM in your browser.

Note that you can pass the prop `class-names`, with an object of class names and their replacement to override this.

Class name | Description
---|---
`ais-SearchBox` | Container class
`ais-SearchBox-form` | Wrapping button
`ais-SearchBox-input` | Search input
`ais-SearchBox-submit` | Submit button
`ais-SearchBox-submitIcon` | Magnifier icon used with the search input
`ais-SearchBox-reset` | Reset button used to clear the content of the input
`ais-SearchBox-resetIcon` | Reset icon used inside the reset button
