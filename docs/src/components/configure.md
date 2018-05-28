---
title: Configure
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 10
editable: true
githubSource: docs/src/components/configure.md
---

A component which renders nothing, but allows you to pass extra search parameters that will apply to this search.

Note that other widgets may override certain parameters. For example, using `facetFilters` will be overriden, but `filters` won't be.

<a class="btn btn-static-theme" href="stories/?selectedKind=Configure">🕹 try out live</a>

## Usage

Basic usage:

```html
<ais-configure></ais-configure>
```

Setting 5 hits per page:

```html
<ais-configure :hitsPerPage="5"></ais-configure>
```

Disable query rules:

```html
<ais-configure :enableRules="false"></ais-configure>
```

## Props

Any prop given to this widget will be applied as a [search parameter](https://www.algolia.com/doc/api-reference/search-api-parameters/).

## CSS Classes

Here's a list of CSS classes exposed by this widget. To better understand the underlying
DOM structure, have a look at the generated DOM in your browser.

Class name | Description
---|---
`ais-Configure` | The container of the Configure widget
