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

### Directly in your page

This method uses built bersion of **InstantSearch.js** from the [jsDeliver](https://www.jsdelivr.com/) CDN:

```html
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/instantsearch.js@2.0.0-beta.1/dist/instantsearch.min.css">
<script src="https://cdn.jsdelivr.net/npm/instantsearch.js@2.0.0-beta.1/dist/instantsearch.min.js"></script>
```

You will then have access to the `instantsearch` function in the global scope (window).

The jsDeliver CDN is highly available with [over 110 locations](https://www.jsdelivr.com/features/network-map) in the world.

### With a build system

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

Afterwards, you need to manually load the companion [CSS file](http://cdn.jsdelivr.net/npm/instantsearch.js@2.0.0-beta.1/dist/instantsearch.min.css) into your page.
