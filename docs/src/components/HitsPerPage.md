---
title: HitsPerPage
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 6
editable: true
githubSource: docs/src/components/HitsPerPage.md
---

Displays a `select` element allowing users to choose the number of hits to display.

<a class="btn btn-static-theme" href="stories/?selectedKind=HitsPerPage">🕹 try out live</a>

## Usage

```html
<ais-hits-per-page
  :items="[{
    label: '20 results',
    value: 20,
    default
  }, {
    label: '100 results',
    value: 100
  }]"
  ></ais-hits-per-page>
```

## Props

Name | Type | Required | Default | Description | 
---|---|---|---|---
items | `[<Object>, ...]` | yes | no | Array of possible values for the select, example: <br/>`[{label: 'Ten results', value: 10, default}, {label: 'Twenty results', value: 20}]`.<br/>The item with `default: true` will be the one applied by default.

## CSS classes

Here's a list of CSS classes exposed by this widget. To better understand the underlying
DOM structure, have a look at the generated DOM in your browser.

Class name | Description
---|---
`ais-HitsPerPage` | Container class  
`ais-HitsPerPage-select` | A refinement option
