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
  - [Template configuration](#template-configuration)
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
  - [urlSync](#urlsync)
  - [hierarchicalMenu](#hierarchicalmenu)
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

```js
// Mustache template example
search.addWidget(
  instantsearch.widgets.stats({
    container: '#stats',
    templates: {
      body: '<div>You have {{nbHits}} results, fetched in {{processingTimeMS}}ms.</div>'
    }
  })
);
// Function template example
search.addWidget(
  instantsearch.widgets.stats({
    container: '#stats',
    templates: {
      body: function(data) {
        return '<div>You have ' + data.nbHits + 'results, fetched in ' + data.processingTimMS +'ms.</div>'
      }
    }
  })
);
```

### Template configuration

In order to help you when defining your templates, `instantsearch.js` exposes
a few helpers. All helpers are accessible in the Mustache templating through
`{{#helpers.nameOfTheHelper}}{{valueToFormat}}{{/helpers.nameOfTheHelper}}`. To
use them in the function templates, you'll have to call
`search.templatesConfig.helpers.nameOfTheHelper` where `search` is your current
`instantsearch` instance.

Here is the list of the currently available helpers:

- `formatNumber`: Will accept a number as input and returned the formatted
  version of the number in the locale defined with the `numberLocale` config
  option (defaults to `en-EN`).
  eg. `100000` will be formatted as `100 000` with `en-EN`

Here is the syntax of a helper (`render` is using `search.templatesConfig.compileOptions`):
```js
search.templatesConfig.helpers.emphasis = function(text, render) {
  return '<em>' + render(text) + '</em>';
};
```

In your helper, `this` always refers to the data:
```js
search.templatesConfig.helpers.discount = function(/*text, render*/) {
  var discount = this.price * 0.3;
  return '$ -' + discount;
};
```

You can configure the options passed to `Hogan.compile` by using `search.templatesConfig.compileOptions`. We accept all [compile options](https://github.com/twitter/hogan.js/#compilation-options).

Theses options will be passed to the `Hogan.compile` calls when you pass a custom template.

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
[hierarchicalMenu]: ./widgets-screenshots/hierarchicalMenu.png
[menu]: ./widgets-screenshots/menu.png
[rangeSlider]: ./widgets-screenshots/range-slider.png
[urlSync]: ./widgets-screenshots/url-sync.gif

### searchBox

![Example of the searchBox widget][searchBox]


#### API

```js
/**
 * Instantiate a searchbox
 * @param  {String|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {String} [options.placeholder='Search here'] Input's placeholder
 * @param  {Object} [options.cssClass] CSS classes to add to the input
 * @param  {boolean} [poweredBy=false] Show a powered by Algolia link below the input
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
    cssClass: 'form-control',
    poweredBy: true
  })
);
```

### stats

#### API

```js
/**
 * Display various stats about the current search state
 * @param  {String|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements: root
 * @param  {String|String[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {String|Function} [options.templates.header=''] Header template
 * @param  {String|Function} [options.templates.body='<div>
  {{#hasNoResults}}No results{{/hasNoResults}}
  {{#hasOneResult}}1 result{{/hasOneResult}}
  {{#hasManyResults}}{{#helpers.formatNumber}}{{nbHits}}{{/helpers.formatNumber}} results{{/hasManyResults}}
  <small>found in {{processingTimeMS}}ms</small>
</div>'] Body template
 * @param  {String|Function} [options.templates.footer=''] Footer template
 * @param  {Function} [options.transformData] Function to change the object passed to the `body` template
 * @param  {boolean} [hideWhenNoResults=true] Hide the container when there's no results
 * @return {Object}
 */
```


#### Usage

![Example of the stats widget][stats]

#### API

#### Usage

```html
<div id="stats"></div>
```

```js
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
    transformData: // function to modify the data passed to the template
  })
);
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
 * @param  {String|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {Array} options.indices Array of objects defining the different indices to choose from.
 * @param  {String} options.indices[0].name Name of the index to target
 * @param  {String} options.indices[0].label Label displayed in the dropdown
 * @param  {String|String[]} [options.cssClass] Class name(s) to be added to the generated select element
 * @param  {boolean} [hideWhenNoResults=false] Hide the container when no results match
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
    cssClass: 'form-control'
  })
);
```

### pagination

![Example of the pagination widget][pagination]

#### API

```js
/**
 * Add a pagination menu to navigate through the results
 * @param  {String|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {String|String[]} [options.cssClass] CSS class to be added to the wrapper element
 * @param  {Object} [options.labels] Text to display in the various links (prev, next, first, last)
 * @param  {String} [options.labels.prev] Label for the Previous link
 * @param  {String} [options.labels.next] Label for the Next link
 * @param  {String} [options.labels.first] Label for the First link
 * @param  {String} [options.labels.last] Label for the Last link
 * @param  {Number} [maxPages=20] The max number of pages to browse
 * @param  {String|DOMElement|boolean} [scrollTo='body'] Where to scroll after a click, set to `false` to disable
 * @param  {boolean} [showFirstLast=true] Define if the First and Last links should be displayed
 * @param  {boolean} [hideWhenNoResults=true] Hide the container when no results match
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
 * @param  {String|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {String|Function} [options.templates.empty=''] Template to use when there are no results.
 * Gets passed the `result` from the API call.
 * @param  {String|Function} [options.templates.hit=''] Template to use for each result.
 * Gets passed the `hit` of the result.
 * @param  {Object} [options.transformData] Method to change the object passed to the templates
 * @param  {Function} [options.transformData.empty=''] Method used to change the object passed to the empty template
 * @param  {Function} [options.transformData.hit=''] Method used to change the object passed to the hit template
 * @param  {Number} [hitsPerPage=20] The number of hits to display per page
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
      hit: '<div><strong>{{name}}</strong> {{price}}</div>'
    },
    transformData: {
      hit: function(data) {
        data.price = data.price + '$';
        return data;
      }
    },
    hitsPerPage: 20
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

#### API

```js
/**
 * Instantiate the toggling of a boolean facet filter on and off.
 * Note that it will not toggle between `true` and `false, but between `true`
 * and `undefined`.
 * @param  {String|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {String} options.facetName Name of the attribute for faceting (eg. "free_shipping")
 * @param  {String} options.label Human-readable name of the filter (eg. "Free Shipping")
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements: root, list, item
 * @param  {String|String[]} [options.cssClasses.root]
 * @param  {String|String[]} [options.cssClasses.list]
 * @param  {String|String[]} [options.cssClasses.item]
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {String|Function} [options.templates.header=''] Header template
 * @param  {String|Function} [options.templates.body='<label>{{label}}<input type="checkbox" {{#isRefined}}checked{{/isRefined}} /></label>'] Body template
 * @param  {String|Function} [options.templates.footer=''] Footer template
 * @param  {Function} [options.transformData] Function to change the object passed to the item template
 * @param  {boolean} [hideWhenNoResults=true] Hide the container when there's no results
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

### refinementList

![Example of the refinementList widget][refinementList]

#### API

```js
/**
 * Instantiate a list of refinements based on a facet
 * @param  {String|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {String} options.facetName Name of the attribute for faceting
 * @param  {String} options.operator How to apply refinements. Possible values: `or`, `and`
 * @param  {String[]} [options.sortBy=['count:desc']] How to sort refinements. Possible values: `count|isRefined|name:asc|desc`
 * @param  {String} [options.limit=100] How much facet values to get
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements: root, list, item
 * @param  {String|String[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {String|String[]} [options.cssClasses.list] CSS class to add to the list element
 * @param  {String|String[]} [options.cssClasses.item] CSS class to add to each item element
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {String|Function} [options.templates.header=''] Header template
 * @param  {String|Function} [options.templates.item=`<label>
  <input type="checkbox" value="{{name}}" {{#isRefined}}checked{{/isRefined}} />{{name}} <span>{{count}}</span>
</label>`] Item template, provided with `name`, `count`, `isRefined`
 * @param  {String|Function} [options.templates.footer=''] Footer template
 * @param  {Function} [options.transformData] Function to change the object passed to the item template
 * @param  {String|Function} [options.singleRefine=false] Are multiple refinements allowed or only one at the same time. You can use this
 *                                                       to build radio based refinement lists for example
 * @param  {boolean} [hideWhenNoResults=true] Hide the container when there's no results
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
 * @param  {String|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {String} options.facetName Name of the attribute for faceting
 * @param  {String[]} [options.sortBy=['count:desc']] How to sort refinements. Possible values: `count|isRefined|name:asc|desc`
 * @param  {String} [options.limit=100] How many facets values to retrieve
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements: root, list, item
 * @param  {String|String[]} [options.cssClasses.root] CSS class to be added to the wrapper element
 * @param  {String|String[]} [options.cssClasses.list] CSS class to be added to the list element
 * @param  {String|String[]} [options.cssClasses.item] CSS class to be added to each item of the list
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {String|Function} [options.templates.header=''] Header template
 * @param  {String|Function} [options.templates.item='<a href="{{href}}">{{name}}</a> {{count}}'] Item template, provided with `name`, `count`, `isRefined`
 * @param  {String|Function} [options.templates.footer=''] Footer template
 * @param  {Function} [options.transformData] Method to change the object passed to the item template
 * @param  {boolean} [hideWhenNoResults=true] Hide the container when no results match
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
 * @param  {String|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {String} options.facetName Name of the attribute for faceting
 * @param  {Boolean|Object} [options.tooltips=true] Should we show tooltips or not.
 * The default tooltip will show the formatted corresponding value without any other token.
 * You can also provide
 * tooltips: {format: function(formattedValue, rawValue) {return '$' + formattedValue}}
 * So that you can format the tooltip display value as you want
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {String|Function} [options.templates.header=''] Header template
 * @param  {String|Function} [options.templates.footer=''] Footer template
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements: root, body
 * @param  {String|String[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {String|String[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {boolean} [hideWhenNoResults=true] Hide the container when no results match
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

### urlSync

![Example of urlSync][urlSync]

#### API

```js
/**
 * Instanciate a url sync widget. This widget let you synchronize the search
 * parameters with the URL. It can operate with legacy API and hash or it can use
 * the modern history API. By default, it will use the modern API, but if you are
 * looking for compatibility with IE8 and IE9, then you should set 'useHash' to
 * true.
 * @class
 * @param {UrlUtil} urlUtils an object containing the function to read, watch the changes
 * and update the URL.
 * @param {object} options may contain the following keys :
 *  - threshold:number time in ms after which a new state is created in the browser
 * history. The default value is 700.
 *  - trackedParameters:string[] parameters that will be synchronized in the
 * URL. By default, it will track the query, all the refinable attribute (facets and numeric
 * filters), the index and the page.
 *  - useHash:boolean if set to true, the url will be hash based. Otherwise,
 * it'll use the query parameters using the modern history API.
 */
```

#### Usage

```js
search.addWidget(
  instantsearch.widgets.urlSync({
/*  useHash: true,
    threshold: 600,
    trackedParameters: ['query', 'page', 'attribute:*'] */
  })
);
```

### hierarchicalMenu

![Example of the hierarchicalMenu widget][hierarchicalMenu]

#### API

```js
/**
 * Create a hierarchical menu using multiple attributes
 * @param  {String|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {String[]} options.attributes Array of attributes to use to generate the hierarchy of the menu.
 * You need to follow some conventions:
 * @param  {String[]} [options.sortBy=['count:desc']] How to sort refinements. Possible values: `count|isRefined|name:asc|desc`
 * @param  {Number} [options.limit=100] How much facet values to get
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements: root, list, item
 * @param  {String|String[]} [options.cssClasses.root] CSS class added to the root element
 * @param  {String|String[]} [options.cssClasses.list] CSS class added to each list element
 * @param  {String|String[]} [options.cssClasses.item] CSS class added to each item element
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {String|Function} [options.templates.header=''] Header template (root level only)
 * @param  {String|Function} [options.templates.item='<a href="{{href}}">{{name}}</a> {{count}}'] Item template, provided with `name`, `count`, `isRefined`, `path`
 * @param  {String|Function} [options.templates.footer=''] Footer template (root level only)
 * @param  {Function} [options.transformData] Method to change the object passed to the item template
 * @param  {boolean} [hideWhenNoResults=true] Hide the container when there's no results
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
