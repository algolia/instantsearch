# instantsearch.js

*instantsearch.js* is a library of widgets to build high performance instant search experiences using Algolia

See the [online demo](http://algolia.github.io/instantsearch.js/).

[![Version][version-svg]][package-url] [![Build Status][travis-svg]][travis-url] [![License][license-image]][license-url] [![Downloads][downloads-image]][downloads-url]

[travis-svg]: https://img.shields.io/travis/algolia/instantsearch.js/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/algolia/instantsearch.js
[license-image]: http://img.shields.io/badge/license-MIT-green.svg?style=flat-square
[license-url]: LICENSE
[downloads-image]: https://img.shields.io/npm/dm/instantsearch.js.svg?style=flat-square
[downloads-url]: http://npm-stat.com/charts.html?package=instantsearch.js
[version-svg]: https://img.shields.io/npm/v/instantsearch.js.svg?style=flat-square
[package-url]: https://npmjs.org/package/instantsearch.js

API is unstable. We welcome any idea and pull request.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Setup](#setup)
  - [npm, browserify, webpack](#npm-browserify-webpack)
  - [`<script>`](#script)
- [Usage](#usage)
- [Widget API](#widget-api)
- [Templates](#templates)
  - [Examples](#examples)
  - [Template helpers](#template-helpers)
- [Development workflow](#development-workflow)
- [Test](#test)
- [Available widgets](#available-widgets)
  - [searchBox](#searchbox)
  - [stats](#stats)
  - [indexSelector](#indexselector)
  - [pagination](#pagination)
  - [hits](#hits)
  - [toggle](#toggle)
  - [refinementList](#refinementlist)
  - [menu](#menu)
  - [rangeSlider](#rangeslider)
- [Browser support](#browser-support)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Setup

### npm, browserify, webpack

```sh
npm install instantsearch.js --save-dev
```

### `<script>`

instantsearch.js is available on [jsDelivr](http://www.jsdelivr.com/):

```html
<script src="//cdn.jsdelivr.net/instantsearch.js/0/instantsearch.min.js"></script>
```

## Usage

```js
var instantsearch = require('instantsearch.js');
var search = instantsearch({
  appId: appId, // Mandatory
  apiKey: apiKey, // Mandatory
  indexName: indexName, // Mandatory
  numberLocale: 'fr-FR' // Optional, defaults to 'en-EN'
});

// add a widget
search.addWidget(
  instantsearch.widgets.searchBox({
    container: '#search-box',
    placeholder: 'Search for libraries in France...'
  })
);

// start
search.start();
```

## Widget API

```js
function mySuperWidget(opts) {

  return {
    getConfiguration: function(searchParameters) {
      return {
        // helper params
      }
    },
    init: function(initialState, helper) {
      // helper: see http://algolia.github.io/algoliasearch-helper-js/docs/
      // called before first `helper.on('result');`
    },
    render: function(results, state, helper) {
      // content: see http://algolia.github.io/algoliasearch-helper-js/docs/SearchResults.html
      // helper: see http://algolia.github.io/algoliasearch-helper-js/docs/
      // called at each `helper.on('result')`
    }
  }
}

search.addWidget(mySuperWidget());
```

## Templates

Most of the widgets accept a `template` or `templates` option that let you
change the default rendering.

`template` can be defined either as a Mustache (Hogan) string or as a function receiving
the widget data.

See the documentation of each widget to see which data is passed to the
template.

### Examples

```javascript
// Mustache template example
search.addWidget(
  instantsearch.widgets.stats({
    container: '#stats',
    template: '<div>You have {{nbHits}} results, fetched in {{processingTimeMS}}ms.</div>'
  })
);
// Function template example
search.addWidget(
  instantsearch.widgets.stats({
    container: '#stats',
    template: function(data) {
      return '<div>You have ' + data.nbHits + 'results, fetched in ' + data.processingTimMS +'ms.</div>'
    }
  })
);
```

### Template helpers

In order to help you when defining your templates, `instantsearch.js` exposes
a few helpers. All helpers are accessible in the Mustache templating through
`{{#helpers.nameOfTheHelper}}{{valueToFormat}}{{/helpers.nameOfTheHelper}}`. To
use them in the function templates, you'll have to call
`search.templateHelpers.nameOfTheHelper` where `search` is your current
`instantsearch` instance.

Here is the list of the currently available helpers:

- `formatNumber`: Will accept a number as input and returned the formatted
  version of the number in the locale defined with the `numberLocale` config
  option (defaults to `en-EN`).
  eg. `100000` will be formatted as `100 000` with `en-EN`

## Development workflow

```sh
npm run dev
# open http://localhost:8080
# make changes in your widgets, or in example/app.js
```

## Test

```sh
npm test # test and lint
npm run test:watch # developer mode, test only
```

## Available widgets

[searchBox]: ./widgets-screenshots/search-box.png
[stats]: ./widgets-screenshots/stats.png
[indexSelector]: ./widgets-screenshots/index-selector.png
[pagination]: ./widgets-screenshots/pagination.png
[hits]: ./widgets-screenshots/hits.png
[toggle]: ./widgets-screenshots/toggle.png
[refinementList]: ./widgets-screenshots/refinement-list.png
[menu]: ./widgets-screenshots/menu.png
[rangeSlider]: ./widgets-screenshots/range-slider.png

### searchBox

![Example of the searchBox widget][searchBox]

```html
<div id="search-box"></div>
```

```js
search.addWidget(
  instantsearch.widgets.searchBox({
    container: '#search-box',
    placeholder: 'Search for products',
    // cssClass
    // poweredBy: boolean
  })
);
```

### stats

![Example of the stats widget][stats]

```html
<div id="stats"></div>
```

```javascript
search.addWidget(
  instantsearch.widgets.stats({
    container: '#stats',
    template: // mustache string or function(stats) with the following keys
              // hasManyResults: boolean
              // hasNoResults: boolean
              // hasOneResult: boolean
              // hitsPerPage: number
              // nbHits: number
              // nbPages: number
              // page: number
              // processingTimeMS: number
              // query: string
  })
);
```

### indexSelector

![Example of the indexSelector widget][indexSelector]

This widget will let you change the current index being targeted. This is
especially useful for changing the current sort order. If you need your results
ordered following a special rule (like price ascending or price descending),
you'll need several indices. This widget lets you easily change it.

```html
<div id="index-selector"></div>
```

```javascript
search.addWidget(
  instantsearch.widgets.indexSelector({
    container: '#index-selector',
    indices: [
      {name: 'instant_search', label: 'Most relevant'},
      {name: 'instant_search_price_asc', label: 'Lowest price'},
      {name: 'instant_search_price_desc', label: 'Highest price'}
    ],
    cssClass: 'form-control'
  })
);
```

```javascript
/**
 * Instantiate a dropdown element to choose the current targeted index
 * @param  {String|DOMElement} options.container Valid CSS Selector as a string or DOMElement
 * @param  {Array} options.indices Array of objects defining the different indices to choose from. Each object must contain a `name` and `label` key.
 * @param  {String} [options.cssClass] Class name(s) to be added to the generated select element
 * @return {Object}
 */
```

### pagination

![Example of the pagination widget][pagination]

```html
<div id="pagination"></div>
```

```js
search.addWidget(
  instantsearch.widgets.pagination({
    container: '#pagination',
    // cssClass, // add cssClasses to the main wrapper
    // padding: 3, // number of page numbers to show before/after current
    // showFirstLast: true, // show or hide first and last links
    // maxPages, // automatically computed based on the result set
    // labels: {
    //   prev: '‹', // &lsaquo;
    //   next: '›', // &rsaquo;
    //   first: '«', // &laquo;
    //   last: '»' // &raquo;
    // }
  })
);
```

### hits

![Example of the hits widget][hits]

```html
<div id="hits"></div>
```

```js
search.addWidget(
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      empty, // string (mustache format) or function(hit) return string 
      hit // string (mustache format) or function(hit) return string
    },
    hitsPerPage: 20,
    // cssClass
  })
);
```

### toggle

![Example of the toggle widget][toggle]

This widget is used to add filtering of results on a boolean value. Let's say
you want to only display elements that are eligible to free shipping. You'll
just have to instantiate this widget with a `facetName` of `free_shipping` (with
`free_shipping` being a boolean attribute in your records.

When toggling on this widget, only hits with Free Shipping will be displayed.
When switching it off, all items will be displayed.

Note that we are not toggling from `true` to `false` here, but from `true` to
`undefined`.

```html
<div id="free_shipping"></div>
```

```javascript
search.addWidget(
  instantsearch.widgets.toggle({
    container: '#free_shipping',
    facetName: 'free_shipping',
    label: 'Free Shipping',
    template: '<label><input type="checkbox" {{#isRefined}}checked{{/isRefined}} />{{label}}</label>'
  })
);
```

```javascript
/**
 * Instantiate the toggling of a boolean facet filter on and off.
 * Note that it will not toggle between `true` and `false, but between `true`
 * and `undefined`.
 * @param  {String|DOMElement} options.container Valid CSS Selector as a string or DOMElement
 * @param  {String} options.facetName Name of the attribute for faceting (eg. "free_shipping")
 * @param  {String} options.label Human-readable name of the filter (eg. "Free Shipping")
 * @param  {String|Function} [options.template] Item template, provided with `label` and `isRefined`
 * @return {Object}
 */
```


### refinementList

![Example of the refinementList widget][refinementList]

#### API

```js
/**
 * Instantiate a list of refinements based on a facet
 * @param  {String|DOMElement} options.container Valid CSS Selector as a string or DOMElement
 * @param  {String} options.facetName Name of the attribute for faceting
 * @param  {String} options.operator How to apply refinements. Possible values: `or`, `and`
 * @param  {String[]} [options.sortBy=['count:desc']] How to sort refinements. Possible values: `count|isRefined|name:asc|desc`
 * @param  {String} [options.limit=100] How much facet values to get.
 * @param  {String|String[]} [options.rootClass=null] CSS class(es) for the root `<ul>` element
 * @param  {String|String[]} [options.itemClass=null] CSS class(es) for the item `<li>` element
 * @param  {String|Function} [options.template] Item template, provided with `name`, `count`, `isRefined`
 * @param  {String|Function} [options.singleRefine=true] Are multiple refinements allowed or only one at the same time. You can use this
 *                                                       to build radio based refinement lists for example.
 * @return {Object}
 */
```


#### Usage

```html
<div id="brands"></div>
```

```js
search.addWidget(
  instantsearch.widgets.refinementList({
    container: '#brands', 
    facetName: 'brands',
    operator: 'or'
  })
);
```

### menu

![Example of the menu widget][menu]

#### API

```js
/**
 * Create a menu out of a facet
 * @param  {String|DOMElement} options.container Valid CSS Selector as a string or DOMElement
 * @param  {String} options.facetName Name of the attribute for faceting
 * @param  {String[]} [options.sortBy=['count:desc']] How to sort refinements. Possible values: `count|isRefined|name:asc|desc`
 * @param  {String} [options.limit=100] How much facet values to get.
 * @param  {String|String[]} [options.rootClass=null] CSS class(es) for the root `<ul>` element
 * @param  {String|String[]} [options.itemClass=null] CSS class(es) for the item `<li>` element
 * @param  {String|Function} [options.template] Item template, provided with `name`, `count`, `isRefined`
 * @return {Object}
 */
```


#### Usage

```html
<div id="categories"></div>
```

```js
search.addWidget(
  instantsearch.widgets.menu({
    container: '#categories', 
    facetName: 'categories'
  })
);
```

### rangeSlider

![Example of the rangeSlider widget][rangeSlider]

#### API

```js
/**
 * Instantiate a slider based on a numeric attribute
 * @param  {String|DOMElement} options.container Valid CSS Selector as a string or DOMElement
 * @param  {String} options.facetName Name of the attribute for faceting
 * @param  {Boolean|Object} [options.tooltips=true] Should we show tooltips or not.
 * The default tooltip will show the formatted corresponding value without any other token.
 * You can also provide
 * tooltips: {format: function(formattedValue, rawValue) {return '$' + formattedValue}}
 * So that you can format the tooltip display value as you want
 * @return {Object}
 */
```

#### Usage

```html
<div id="price"></div>
```

```js
search.addWidget(
  instantsearch.widgets.rangeSlider({
    container: '#price',
    facetName: 'price',
    tooltips: {
      format: function(formattedValue) {
        return '$' + formattedValue;
      }
    }
  })
);
```

## Browser support

We support IE9+ and all other modern browsers.

To get IE8 support, please insert this in the `<head>`:

```html
<meta http-equiv="X-UA-Compatible" content="IE=Edge">
<!--[if lte IE 8]>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/aight/1.2.2/aight.min.js"></script>
<![endif]-->
```

We use the [shawnbot/aight](https://github.com/shawnbot/aight) polyfill.

**Always put the `<script>` after any `jQuery` library**, see https://github.com/shawnbot/aight/issues/42.
