# instantsearch.js

*instantsearch.js* is a library of widgets to build high performance instant search experiences using Algolia

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

To get started, check out [algolia.github.com/instantsearch.js](https://algolia.github.com/instantsearch.js)!


## Table of contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Setup](#setup)
  - [npm, browserify, webpack](#npm-browserify-webpack)
  - [`<script>`](#script)
- [Quick Start](#quick-start)
- [Browser support](#browser-support)
- [Development workflow](#development-workflow)
- [Test](#test)
- [License](#license)
- [More...](#more)

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

## Quick Start

```js
var instantsearch = require('instantsearch.js');
var search = instantsearch({
  appId: appId, // Mandatory
  apiKey: apiKey, // Mandatory
  indexName: indexName, // Mandatory
  numberLocale: 'fr-FR' // Optional, defaults to 'en-EN',
  urlSync: { // optionnal, activate url sync if defined
    useHash: false
  }
});

// add a search box widget
search.addWidget(
  instantsearch.widgets.searchBox({
    container: '#search-box',
    placeholder: 'Search for libraries in France...'
  })
);

// add a hits widget
search.addWidget(
  instantsearch.widgets.hits({
    container: '#hits-container',
    hitsPerPage: 10
  })
);

// start
search.start();
```
## Browser support

We natively support IE10+ and all other modern browsers without any dependency need
on your side.

To get < IE10 support, please insert this code in the `<head>`:

```html
<meta http-equiv="X-UA-Compatible" content="IE=Edge">
<!--[if lte IE 9]>
  <script src="https://cdn.polyfill.io/v2/polyfill.min.js"></script>
<![endif]-->
```

We use the [polyfill.io](https://cdn.polyfill.io/v2/docs/).

## Themes

To help get you started, we provide a default theme for the widgets. This is
just a `css` file that you have to add to your page to add basic styling.

It is available from [jsDelivr](http://www.jsdelivr.com/):

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/instantsearch.js/0/themes/default.min.css">
<!-- or the unminified version -->
<link rel="stylesheet" href="//cdn.jsdelivr.net/instantsearch.js/0/themes/default.css">
```

It contains (empty) selectors for all the possible markup added by the widgets,
so you can use it as a base for creating your own custom theme. We will provide
more themes in the future.

## Development workflow

```sh
npm run dev
# open http://localhost:8080
# make changes in your widgets, or in example/app.js
```

## Test

```sh
npm test # jsdom + lint
npm run test:watch # jsdom
npm run test:watch:browser # chrome
npm run test:watch:browser -- --browsers ChromeCanary # force Chrome Canary
```

## Instant search configuration

The main configuration of instantsearch.js is done through a configuration object.
The minimal configuration is made a of three attributes :

```js
instantsearch({
  appId: 'my_application_id',
  apiKey: 'my_search_api_key',
  indexName: 'my_index_name'
});
```

It can also contain other optionnal attributes to enable other features.

### Number locale

For the display of numbers, the locale will be determined by
the browsers or forced in the configuration :

```js
instantsearch({
  appId: 'my_application_id',
  apiKey: 'my_search_api_key',
  indexName: 'my_index_name',
  numberLocale: 'en-US'
});
```

### Initial search parameters

At the start of instantsearch, the search configuration is based on the input
of each widget and the URL. It is also possible to change the defaults of 
the configuration through an object that can contain any parameters understood
by the Algolia API.

```js
instantsearch({
  appId: 'my_application_id',
  apiKey: 'my_search_api_key',
  indexName: 'my_index_name',
  searchParameters: {
    typoTolerance: 'strict'
  }
});
```

### URL synchronisation

Instantsearch let you synchronize the url with the current search parameters.
In order to activate this feature, you need to add the urlSync object. It accepts
3 parameters : 
   - trackedParameters:string[] parameters that will be synchronized in the
      URL. By default, it will track the query, all the refinable attribute (facets and numeric
      filters), the index and the page.
   - useHash:boolean if set to true, the url will be hash based. Otherwise,
      it'll use the query parameters using the modern history API.
   - threshold:number time in ms after which a new state is created in the browser
      history. The default value is 700.

All those parameters are optional and a minimal configuration looks like :

```js
instantsearch({
  appId: 'my_application_id',
  apiKey: 'my_search_api_key',
  indexName: 'my_index_name',
  urlSync: {}
});
```

<<<<<<< HEAD
## Available widgets

[searchBox]: ./widgets-screenshots/search-box.png
[stats]: ./widgets-screenshots/stats.png
[indexSelector]: ./widgets-screenshots/index-selector.png
[hitsPerPageSelector]: ./widgets-screenshots/hits-per-page-selector.png
[pagination]: ./widgets-screenshots/pagination.png
[hits]: ./widgets-screenshots/hits.png
[toggle]: ./widgets-screenshots/toggle.png
[refinementList]: ./widgets-screenshots/refinement-list.png
[hierarchicalMenu]: ./widgets-screenshots/hierarchicalMenu.png
[menu]: ./widgets-screenshots/menu.png
[rangeSlider]: ./widgets-screenshots/range-slider.png
[priceRanges]: ./widgets-screenshots/price-ranges.png

### searchBox

![Example of the searchBox widget][searchBox]


#### API

```js
/**
 * Instantiate a searchbox
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} [options.placeholder] Input's placeholder
 * @param  {Object} [options.cssClasses] CSS classes to add
 * @param  {string} [options.cssClasses.root] CSS class to add to the wrapping div (if wrapInput set to `true`)
 * @param  {string} [options.cssClasses.input] CSS class to add to the input
 * @param  {string} [options.cssClasses.poweredBy] CSS class to add to the poweredBy element
 * @param  {boolean} [poweredBy=false] Show a powered by Algolia link below the input
 * @param  {boolean} [wrapInput=true] Wrap the input in a div.ais-search-box
 * @param  {boolean|string} [autofocus='auto'] autofocus on the input
 * @return {Object}
 */
```

#### Usage

```html
<input id="search-box" />
Or
<div id="search-box"></div>
```

```js
search.addWidget(
  instantsearch.widgets.searchBox({
    container: '#search-box',
    placeholder: 'Search for products',
    poweredBy: true
  })
);
```

#### Styling

```html
<div class="ais-search-box">
  <input class="ais-search-box--input">
  <div class="ais-search-box--powered-by">
    Powered by
    <a class="ais-search-box--powered-by-link">Algolia</a>
  </div>
</div>
```

```css
.ais-search-box {
}
.ais-search-box--input {
}
.ais-search-box--powered-by {
}
.ais-search-box--powered-by-link {
}
```
### stats

![Example of the stats widget][stats]

#### API

```js
/**
 * Display various stats about the current search state
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {Object} [options.cssClasses] CSS classes to add
 * @param  {string} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {string} [options.cssClasses.time] CSS class to add to the element wrapping the time processingTimeMs
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header=''] Header template
 * @param  {string|Function} [options.templates.body] Body template
 * @param  {string|Function} [options.templates.footer=''] Footer template
 * @param  {Function} [options.transformData] Function to change the object passed to the `body` template
 * @param  {boolean} [hideContainerWhenNoResults=true] Hide the container when there's no results
 * @return {Object}
 */
```

#### Usage

```html
<div id="stats"></div>
```

```js
search.addWidget(
  instantsearch.widgets.stats({
    container: '#stats',
    cssClasses: {
      time: 'label label-info'
    }
  })
);
```

#### Styling

```html
<div class="ais-stats">
  <div class="ais-stats--header ais-header">[custom header template]</div>
  <div class="ais-stats--body">
    42 results found in <span class="ais-stats--time">42ms</span>
  </div>
  <div class="ais-stats--footer ais-footer">[custom footer template]</div>
</div>
```

```css
.ais-stats {
}
.ais-stats--header {
}
.ais-stats--body {
}
.ais-stats--time {
  font-size: small;
}
.ais-stats--footer {
}
```

### indexSelector

![Example of the indexSelector widget][indexSelector]

This widget will let you change the current index being targeted. This is
especially useful for changing the current sort order. If you need your results
ordered following a special rule (like price ascending or price descending),
you'll need several indices. This widget lets you easily change it.

#### API

```js
/**
 * Instantiate a dropdown element to choose the current targeted index
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {Array} options.indices Array of objects defining the different indices to choose from.
 * @param  {string} options.indices[0].name Name of the index to target
 * @param  {string} options.indices[0].label Label displayed in the dropdown
 * @param  {Object} [options.cssClasses] CSS classes to be added
 * @param  {string} [options.cssClasses.root] CSS classes added to the parent <select>
 * @param  {string} [options.cssClasses.item] CSS classes added to each <option>
 * @param  {boolean} [hideContainerWhenNoResults=false] Hide the container when no results match
 * @return {Object}
 */
```

#### Usage

```html
<div id="index-selector"></div>
```

```js
search.addWidget(
  instantsearch.widgets.indexSelector({
    container: '#index-selector',
    indices: [
      {name: 'instant_search', label: 'Most relevant'},
      {name: 'instant_search_price_asc', label: 'Lowest price'},
      {name: 'instant_search_price_desc', label: 'Highest price'}
    ],
    cssClasses: {
      root: 'form-control'
    }
  })
);
```

#### Styling

```html
<select class="ais-index-selector">
  <option class="ais-index-selector--item">Most relevant</option>
  <option class="ais-index-selector--item">Lowest price</option>
  <option class="ais-index-selector--item">Highest price</option>
</select>
```

```css
.ais-index-selector {
}
.ais-index-selector--item {
}
```

### hitsPerPageSelector

![Example of the hitsPerPageSelector widget][hitsPerPageSelector]

This widget will let you change the current number of results being
displayed per page.

#### API

```js
/**
 * Instantiate a dropdown element to choose the number of hits to display per page
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {Array} options.options Array of objects defining the different values and labels
 * @param  {number} options.options[0].value number of hits to display per page
 * @param  {string} options.options[0].label Label to display in the option
 * @param  {Object} [options.cssClasses] CSS classes to be added
 * @param  {string} [options.cssClasses.root] CSS classes added to the parent <select>
 * @param  {string} [options.cssClasses.item] CSS classes added to each <option>
 * @param  {boolean} [hideContainerWhenNoResults=false] Hide the container when no results match
 * @return {Object}
 */
```

#### Usage

```html
<div id="hits-per-page-selector"></div>
```

```js
search.addWidget(
  instantsearch.widgets.hitsPerPageSelector({
    container: '#hits-per-page-selector',
    options: [
      {value: 6, label: '6 per page'},
      {value: 12, label: '12 per page'},
      {value: 24, label: '24 per page'}
    ],
    cssClasses: {
      select: 'form-control'
    }
  })
);
```

#### Styling

```html
<select class="ais-hits-per-page-selector">
  <option class="ais-hits-per-page-selector--item">6 per page</option>
  <option class="ais-hits-per-page-selector--item">12 per page</option>
  <option class="ais-hits-per-page-selector--item">24 per page</option>
</select>
```

```css
.ais-hits-per-page-selector {
}
.ais-hits-per-page-selector--item {
}
```

### pagination

![Example of the pagination widget][pagination]

#### API

```js
/**
 * Add a pagination menu to navigate through the results
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string|string[]} [options.cssClass] CSS class to be added to the wrapper element
 * @param  {Object} [options.labels] Text to display in the various links (prev, next, first, last)
 * @param  {string} [options.labels.prev] Label for the Previous link
 * @param  {string} [options.labels.next] Label for the Next link
 * @param  {string} [options.labels.first] Label for the First link
 * @param  {string} [options.labels.last] Label for the Last link
 * @param  {number} [maxPages=20] The max number of pages to browse
 * @param  {string|DOMElement|boolean} [scrollTo='body'] Where to scroll after a click, set to `false` to disable
 * @param  {boolean} [showFirstLast=true] Define if the First and Last links should be displayed
 * @param  {boolean} [hideContainerWhenNoResults=true] Hide the container when no results match
 * @return {Object}
 */
```

#### Usage

```html
<div id="pagination"></div>
```

```js
search.addWidget(
  instantsearch.widgets.pagination({
    container: '#pagination',
    cssClass: 'pagination',
    labels: {
      prev: '< Previous',
      next: 'Next >',
      first: '<< First',
      last: 'Last >>'
    },
    maxPages: 10,
    showFirstLast: true
  })
);
```

### hits

![Example of the hits widget][hits]

#### API

```js
/**
 * Display the list of results (hits) from the current search
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {Object} [options.cssClasses] CSS classes to add
 * @param  {string} [options.cssClasses.root] CSS class to add to the wrapping element
 * @param  {string} [options.cssClasses.empty] CSS class to add to the wrapping element when no results
 * @param  {string} [options.cssClasses.item] CSS class to add to each result
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.empty=''] Template to use when there are no results.
 * @param  {string|Function} [options.templates.item=''] Template to use for each result.
 * @param  {Object} [options.transformData] Method to change the object passed to the templates
 * @param  {Function} [options.transformData.empty=''] Method used to change the object passed to the empty template
 * @param  {Function} [options.transformData.item=''] Method used to change the object passed to the item template
 * @param  {number} [hitsPerPage=20] The number of hits to display per page
 * @return {Object}
 */
```

#### Usage

```html
<div id="hits"></div>
```

```js
search.addWidget(
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      empty: 'No results'
      item: '<div><strong>{{name}}</strong> {{price}}</div>'
    },
    transformData: {
      item: function(data) {
        data.price = data.price + '$';
        return data;
      }
    },
    hitsPerPage: 20
  })
);
```

#### Styling

```html
<div class="ais-hits">
  <div class="ais-hits--item">Hit content</div>
  ...
  <div class="ais-hits--item">Hit content</div>
</div>
<!-- If no results -->
<div class="ais-hits ais-hits__empty">
  No results
</div>
```

```css
.ais-hits {
}
.ais-hits--item {
}
.ais-hits__empty {
}
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

#### API

```js
/**
 * Instantiate the toggling of a boolean facet filter on and off.
 * Note that it will not toggle between `true` and `false, but between `true`
 * and `undefined`.
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} options.facetName Name of the attribute for faceting (eg. "free_shipping")
 * @param  {string} options.label Human-readable name of the filter (eg. "Free Shipping")
 * @param  {Object} [options.cssClasses] CSS classes to add
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {string|string[]} [options.cssClasses.list] CSS class to add to the list element
 * @param  {string|string[]} [options.cssClasses.item] CSS class to add to each item element
 * @param  {string|string[]} [options.cssClasses.active] CSS class to add to each active element
 * @param  {string|string[]} [options.cssClasses.label] CSS class to add to each label element (when using the default template)
 * @param  {string|string[]} [options.cssClasses.checkbox] CSS class to add to each checkbox element (when using the default template)
 * @param  {string|string[]} [options.cssClasses.count] CSS class to add to each count element (when using the default template)
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header=''] Header template
 * @param  {string|Function} [options.templates.item] Item template
 * @param  {string|Function} [options.templates.footer=''] Footer template
 * @param  {Function} [options.transformData] Function to change the object passed to the item template
 * @param  {boolean} [hideContainerWhenNoResults=true] Hide the container when there's no results
 * @return {Object}
 */
```

#### Usage

```html
<div id="free-shipping"></div>
```

```js
search.addWidget(
  instantsearch.widgets.toggle({
    container: '#free-shipping',
    facetName: 'free_shipping',
    label: 'Free Shipping',
    templates: {
      body: '<label><input type="checkbox" {{#isRefined}}checked{{/isRefined}} />{{label}}</label>'
    }
  })
);
```

#### Styling

```html
<div class="ais-toggle">
  <div class="ais-toggle--header ais-header">[custom header template]</div>
  <div class="ais-toggle--body">
    <div class="ais-toggle--list">
      <div class="ais-toggle--item">
        <label class="ais-toggle--label">
          <input type="checkbox" class="ais-toggle--checkbox" value="your_value"> Your value
          <span class="ais-toggle--count">42</span>
        </label>
      </div>
    </div>
  </div>
  <div class="ais-toggle--footer ais-footer">[custom footer template]</div>
</div>
```

```css
.ais-toggle {
}
.ais-toggle--header {
}
.ais-toggle--body {
}
.ais-toggle--list {
}
.ais-toggle--item {
}
.ais-toggle--item__active {
}
.ais-toggle--label {
}
.ais-toggle--checkbox {
}
.ais-toggle--count {
}
.ais-toggle--footer {
}
```
### refinementList

![Example of the refinementList widget][refinementList]

#### API

```js
/**
 * Instantiate a list of refinements based on a facet
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} options.facetName Name of the attribute for faceting
 * @param  {string} [options.operator='or'] How to apply refinements. Possible values: `or`, `and`
 * @param  {string[]} [options.sortBy=['count:desc']] How to sort refinements. Possible values: `count|isRefined|name:asc|desc`
 * @param  {string} [options.limit=1000] How much facet values to get
 * @param  {Object} [options.cssClasses] CSS classes to add
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {string|string[]} [options.cssClasses.list] CSS class to add to the list element
 * @param  {string|string[]} [options.cssClasses.item] CSS class to add to each item element
 * @param  {string|string[]} [options.cssClasses.active] CSS class to add to each active element
 * @param  {string|string[]} [options.cssClasses.label] CSS class to add to each label element (when using the default template)
 * @param  {string|string[]} [options.cssClasses.checkbox] CSS class to add to each checkbox element (when using the default template)
 * @param  {string|string[]} [options.cssClasses.count] CSS class to add to each count element (when using the default template)
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header] Header template
 * @param  {string|Function} [options.templates.item] Item template, provided with `name`, `count`, `isRefined`
 * @param  {string|Function} [options.templates.footer] Footer template
 * @param  {Function} [options.transformData] Function to change the object passed to the item template
 * @param  {boolean} [hideContainerWhenNoResults=true] Hide the container when there's no results
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
    facetName: 'brands'
  })
);
```

#### Styling

```html
<div class="ais-refinement-list">
  <div class="ais-refinement-list--header ais-header">[custom header template]</div>
  <div class="ais-refinement-list--body">
    <div class="ais-refinement-list--list">
      <div class="ais-refinement-list--item">
        <label class="ais-refinement-list--label">
          <input type="checkbox" class="ais-refinement-list--checkbox" value="your_value"> Your value
          <span class="ais-refinement-list--count">42</span>
        </label>
      </div>
      <div class="ais-refinement-list--item ais-refinement-list--item__active">
        <label class="ais-refinement-list--label">
          <input type="checkbox" class="ais-refinement-list--checkbox" value="your_selected_value" checked="checked"> Your selected value
          <span class="ais-refinement-list--count">42</span>
        </label>
      </div>
    </div>
  </div>
  <div class="ais-refinement-list--footer ais-footer">[custom footer template]</div>
</div>
```

```css
.ais-refinement-list {
}
.ais-refinement-list--header {
}
.ais-refinement-list--body {
}
.ais-refinement-list--list {
}
.ais-refinement-list--item {
}
.ais-refinement-list--item__active {
}
.ais-refinement-list--label {
}
.ais-refinement-list--checkbox {
}
.ais-refinement-list--count {
}
.ais-refinement-list--footer {
}
```

### menu

![Example of the menu widget][menu]

#### API

```js
/**
 * Create a menu out of a facet
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} options.facetName Name of the attribute for faceting
 * @param  {string[]} [options.sortBy=['count:desc']] How to sort refinements. Possible values: `count|isRefined|name:asc|desc`
 * @param  {string} [options.limit=100] How many facets values to retrieve
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements: root, list, item
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {string|string[]} [options.cssClasses.list] CSS class to add to the list element
 * @param  {string|string[]} [options.cssClasses.item] CSS class to add to each item element
 * @param  {string|string[]} [options.cssClasses.active] CSS class to add to each active element
 * @param  {string|string[]} [options.cssClasses.link] CSS class to add to each link (when using the default template)
 * @param  {string|string[]} [options.cssClasses.count] CSS class to add to each count element (when using the default template)
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header=''] Header template
 * @param  {string|Function} [options.templates.item] Item template, provided with `name`, `count`, `isRefined`
 * @param  {string|Function} [options.templates.footer=''] Footer template
 * @param  {Function} [options.transformData] Method to change the object passed to the item template
 * @param  {boolean} [hideContainerWhenNoResults=true] Hide the container when there's no results
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

#### Styling

```html
<div class="ais-menu">
  <div class="ais-menu--header ais-header">[custom header template]</div>
  <div class="ais-menu--body">
    <div class="ais-menu--list">
      <div class="ais-menu--item">
        <a class="ais-menu--link" href="/url">
          Your value
          <span class="ais-menu--count">42</span>
        </a>
      </div>
      <div class="ais-menu--item ais-menu--item__active">
        <a class="ais-menu--link" href="/url">
          Your active value
          <span class="ais-menu--count">42</span>
        </a>
      </div>
    </div>
  </div>
  <div class="ais-menu--footer ais-footer">[custom footer template]</div>
</div>
```

```css
.ais-menu {
}
.ais-menu--header {
}
.ais-menu--body {
}
.ais-menu--list {
}
.ais-menu--item {
}
.ais-menu--item__active {
}
.ais-menu--link {
}
.ais-menu--count {
}
.ais-menu--footer {
}
```

### rangeSlider

![Example of the rangeSlider widget][rangeSlider]

#### API

```js
/**
 * Instantiate a slider based on a numeric attribute
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} options.facetName Name of the attribute for faceting
 * @param  {boolean|Object} [options.tooltips=true] Should we show tooltips or not.
 * The default tooltip will show the formatted corresponding value without any other token.
 * You can also provide
 * tooltips: {format: function(formattedValue, rawValue) {return '$' + formattedValue}}
 * So that you can format the tooltip display value as you want
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header=''] Header template
 * @param  {string|Function} [options.templates.footer=''] Footer template
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements: root, body
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {boolean} [hideContainerWhenNoResults=true] Hide the container when no results match
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

### priceRanges

![Example of the pricesRanges widget][priceRanges]

#### API

```js
/**
 * Instantiate a price ranges on a numerical facet
 * @param  {string|DOMElement} options.container Valid CSS Selector as a string or DOMElement
 * @param  {string} options.facetName Name of the attribute for faceting
 * @param  {Object} [options.cssClasses] CSS classes to add
 * @param  {string} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string} [options.cssClasses.list] CSS class to add to the wrapping list element
 * @param  {string} [options.cssClasses.item] CSS class to add to each item element
 * @param  {string} [options.cssClasses.active] CSS class to add to the active item element
 * @param  {string} [options.cssClasses.link] CSS class to add to each link element
 * @param  {string} [options.cssClasses.form] CSS class to add to the form element
 * @param  {string} [options.cssClasses.label] CSS class to add to each wrapping label of the form
 * @param  {string} [options.cssClasses.input] CSS class to add to each input of the form
 * @param  {string} [options.cssClasses.currency] CSS class to add to each currency element of the form
 * @param  {string} [options.cssClasses.separator] CSS class to add to the separator of the form
 * @param  {string} [options.cssClasses.button] CSS class to add to the submit button of the form
 * @param  {string} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.item] Item template
 * @param  {Object} [options.labels] Labels to use for the widget
 * @param  {string|Function} [options.labels.currency] Currency label
 * @param  {string|Function} [options.labels.separator] Separator labe, between min and max
 * @param  {string|Function} [options.labels.button] Button label
 * @param  {boolean} [hideContainerWhenNoResults=true] Hide the container when no results match
 * @return {Object}
 */
```

#### Usage

```js
search.addWidget(
  instantsearch.widgets.priceRanges({
    container: '#price-ranges',
    facetName: 'price'
  })
);
```

#### Styling

```html
<div class="ais-price-ranges">
  <div class="ais-price-ranges--header ais-header">Header</div>
  <div class="ais-price-ranges--body">
    <div class="ais-price-ranges--item">
      <a class="ais-price-ranges--range" href="...">$3 - $13</a>
    </div>
    <div class="ais-price-ranges--item ais-price-ranges--item__active">
      <a class="ais-price-ranges--range" href="...">$13 - $40</a>
    </div>
    <form class="ais-price-ranges--form">
      <label class="ais-price-ranges--label">
        <span class="ais-price-ranges--currency>$ </span>
        <input class="ais-price-ranges--input" />
      </label>
      <span class="ais-price-ranges--separator"> to </span>
      <label class="ais-price-ranges--label">
        <span class="ais-price-ranges--currency>$ </span>
        <input class="ais-price-ranges--input" />
      </label>
      <button class="ais-price-ranges--button">Go</button>
    </form>
  </div>
  <div class="ais-price-ranges--footer ais-footer">Footer</div>
</div>
```

```css
.ais-price-ranges {
}
.ais-price-ranges--header {
}
.ais-price-ranges--body {
}
.ais-price-ranges--list {
}
.ais-price-ranges--item {
}
.ais-price-ranges--item__active {
}
.ais-price-ranges--link {
}
.ais-price-ranges--form {
}
.ais-price-ranges--label {
}
.ais-price-ranges--currency {
}
.ais-price-ranges--input {
}
.ais-price-ranges--separator {
}
.ais-price-ranges--button {
}
.ais-price-ranges--footer {
}

```

### hierarchicalMenu

![Example of the hierarchicalMenu widget][hierarchicalMenu]

#### API

```js
/**
 * Create a hierarchical menu using multiple attributes
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string[]} options.attributes Array of attributes to use to generate the hierarchy of the menu.
 * You need to follow some conventions:
 * @param  {string[]} [options.sortBy=['count:desc']] How to sort refinements. Possible values: `count|isRefined|name:asc|desc`
 * @param  {number} [options.limit=100] How much facet values to get
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements: root, list, item
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {string|string[]} [options.cssClasses.list] CSS class to add to the list element
 * @param  {string|string[]} [options.cssClasses.item] CSS class to add to each item element
 * @param  {string|string[]} [options.cssClasses.active] CSS class to add to each active element
 * @param  {string|string[]} [options.cssClasses.link] CSS class to add to each link (when using the default template)
 * @param  {string|string[]} [options.cssClasses.count] CSS class to add to each count element (when using the default template)
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header=''] Header template (root level only)
 * @param  {string|Function} [options.templates.item] Item template
 * @param  {string|Function} [options.templates.footer=''] Footer template (root level only)
 * @param  {Function} [options.transformData] Method to change the object passed to the item template
 * @param  {boolean} [hideContainerWhenNoResults=true] Hide the container when there's no results
 * @return {Object}
 */
```

#### Algolia requirements

All the `attributes` should be added to `attributesForFaceting` in your index settings.

Your index's objects must be formatted in a way that is expected by the `hierarchicalMenu` widget:

```json
{
  "objectID": "123",
  "name": "orange",
  "categories": {
    "lvl0": "fruits",
    "lvl1": "fruits > citrus"
  }
}
```

#### Usage

```js
search.addWidget(
  instantsearch.widgets.hierarchicalMenu({
    container: '#products',
    attributes: ['categories.lvl0', 'categories.lvl1', 'categories.lvl2']
  })
);
```

#### Styling

```html
<div class="ais-hierarchical-menu">
  <div class="ais-hierarchical-menu--header ais-header">[custom header template]</div>
  <div class="ais-hierarchical-menu--body">
    <div class="ais-hierarchical-menu--list ais-hierarchical-menu--list__lvl0">
      <div class="ais-hierarchical-menu--item">
        <a class="ais-hierarchical-menu--link" href="/url">
          Your value
          <span class="ais-hierarchical-menu--count">42</span>
        </a>
      </div>
      <div class="ais-hierarchical-menu--item ais-hierarchical-menu--item__active">
        <a class="ais-hierarchical-menu--link" href="/url">
          Your active value
          <span class="ais-hierarchical-menu--count">42</span>
        </a>
        <div class="ais-hierarchical-menu--list ais-hierarchical-menu--list__lvl1">
          <div class="ais-hierarchical-menu--item">
            <a class="ais-hierarchical-menu--link" href="/url">
              Your subvalue 1
              <span class="ais-hierarchical-menu--count">10</span>
            </a>
          </div>
          <div class="ais-hierarchical-menu--item">
            <a class="ais-hierarchical-menu--link" href="/url">
              Your subvalue 2
              <span class="ais-hierarchical-menu--count">32</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="ais-hierarchical-menu--footer ais-footer">[custom footer template]</div>
</div>
```

```css
.ais-hierarchical-menu {
}
.ais-hierarchical-menu--header {
}
.ais-hierarchical-menu--body {
}
.ais-hierarchical-menu--list {
}
.ais-hierarchical-menu--list__lvl0 {
}
.ais-hierarchical-menu--list__lvl1 {
}
.ais-hierarchical-menu--item {
}
.ais-hierarchical-menu--item__active {
}
.ais-hierarchical-menu--link {
}
.ais-hierarchical-menu--count {
}
.ais-hierarchical-menu--footer {
}
```
=======
>>>>>>> 1b78e68... chore(website): here and there improvements

## License

instantsearch.js is [MIT licensed](./LICENSE).


## More...

There's only so much we can cram in here. To read more about the community and guidelines for submitting pull requests, please read the [Contributing document](CONTRIBUTING.md).
