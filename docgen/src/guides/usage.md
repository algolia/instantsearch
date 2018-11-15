---
title: Use InstantSearch.js
mainTitle: Guides
layout: main.pug
name: usage
category: guides
withHeadings: true
navWeight: 30
editable: true
githubSource: docgen/src/guides/usage.md
---

## Use InstantSearch.js

InstantSearch.js can be used either with a direct link in your webpage or with a packaging system.

## Directly in your page

This method uses the prebuilt version of **InstantSearch.js** from the [jsDeliver](https://www.jsdelivr.com/) CDN:

```html
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/instantsearch.js@{{pkg.version}}/dist/instantsearch.min.css">
<script src="https://cdn.jsdelivr.net/npm/instantsearch.js@{{pkg.version}}"></script>
```

We also provide you a default Algolia theme for the widgets to be effectively styled:

```html
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/instantsearch.js@{{pkg.version}}/dist/instantsearch-theme-algolia.min.css">
```

You will then have access to the `instantsearch` function in the global scope (window).

> We recommend using jsDelivr only for prototyping, **not for production applications**. Whenever possible, you should host your assets yourself or use a premium CDN service. jsDelivr is a free service and isn’t operated by Algolia, so we won’t be able to provide support if it fails.

## With a build system

If you have a JavaScript build system, you can install **InstantSearch.js** from NPM:

```sh
npm install instantsearch.js --save
# or
yarn add instantsearch.js
```

Then in your module, you can load the main package:

```javascript
const instantsearch = require('instantsearch.js');
```

or if you are using ES modules:

```javascript
import instantsearch from 'instantsearch.js';
```

Afterwards, you need to manually load the companion [CSS file](http://cdn.jsdelivr.net/npm/instantsearch.js@{{pkg.version}}/dist/instantsearch.min.css) into your page.

You can also load into your page the [Algolia default theme](https://cdn.jsdelivr.net/npm/instantsearch.js@{{pkg.version}}/dist/instantsearch-theme-algolia.min.css) for the widgets to be styled.

### Optimize your build with tree shaking

If you are using webpack2+ or rollup as build system, you are elligible for tree shaking.

Tree shaking is a term commonly used in the JavaScript context for dead-code elimination, or more precisely, live-code import. (You can read more about tree shaking [in webpack documentation](https://webpack.js.org/guides/tree-shaking/)).

With InstantSearch.js it's really simple to use, the example speaks for itself:

```javascript
// instantsearch() function without reference to the widgets or connectors
import instantsearch from 'instantsearch.js/es';

// import connectors individually
import {connectSearchBox} from 'instantsearch.js/es/connectors';

// import widgets individually
import {searchBox} from 'instantsearch.js/es/widgets';

const search = instantsearch({ ... });

search.addWidget(searchBox({ ... }));
search.addWidget(connectSearchBox(function() { ... })({ ... }))
```

## Browser support

We support the **last two versions of major browsers** (Chrome, Edge, Firefox, Safari).

To support [IE11](https://en.wikipedia.org/wiki/Internet_Explorer_11), we recommend loading [polyfill.io](https://polyfill.io):

```html
<script src="https://cdn.polyfill.io/v2/polyfill.min.js?features=default,Array.prototype.includes"></script>
```
