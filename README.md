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

## Table of contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Setup](#setup)
  - [From a CDN](#from-a-cdn)
  - [With npm, browserify, webpack](#with-npm-browserify-webpack)
- [Quick Start](#quick-start)
- [Browser support](#browser-support)
- [Development workflow](#development-workflow)
- [Test](#test)
- [Instant search configuration](#instant-search-configuration)
  - [Number locale](#number-locale)
  - [Initial search parameters](#initial-search-parameters)
  - [URL synchronisation](#url-synchronisation)
- [License](#license)
- [More...](#more)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Setup

### From a CDN

instantsearch.js is available on [jsDelivr](http://www.jsdelivr.com/):

```html
<link rel="stylesheet" type="text/css" href="//cdn.jsdelivr.net/instantsearch.js/0/instantsearch.min.css" />
<script src="//cdn.jsdelivr.net/instantsearch.js/0/instantsearch.min.js"></script>
```

### With npm, browserify, webpack

```sh
npm install instantsearch.js --save-dev
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

## License

instantsearch.js is [MIT licensed](./LICENSE).


## More...

There's only so much we can cram in here. To read more about the community and guidelines for submitting pull requests, please read the [Contributing document](CONTRIBUTING.md).
