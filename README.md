[![instantsearch.js logo][readme-logo]][logo-url]

**instantsearch.js** is a library of UI widgets to help you build the best instant-search experience with [Algolia's Hosted Search API](https://www.algolia.com/?utm_medium=social-owned&utm_source=GitHub&utm_campaign=InstantSearch%20repository).

Have a look at the website: [https://community.algolia.com/instantsearch.js/](https://community.algolia.com/instantsearch.js/?utm_medium=social-owned&utm_source=GitHub&utm_campaign=InstantSearch%20repository).

[![Version][version-svg]][package-url] [![Build Status][travis-svg]][travis-url] [![License][license-image]][license-url] [![Downloads][downloads-image]][downloads-url]

[travis-svg]: https://img.shields.io/travis/algolia/instantsearch.js/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/algolia/instantsearch.js
[license-image]: http://img.shields.io/badge/license-MIT-green.svg?style=flat-square
[license-url]: LICENSE
[downloads-image]: https://img.shields.io/npm/dm/instantsearch.js.svg?style=flat-square
[downloads-url]: http://npm-stat.com/charts.html?package=instantsearch.js
[version-svg]: https://img.shields.io/npm/v/instantsearch.js.svg?style=flat-square
[package-url]: https://npmjs.org/package/instantsearch.js
[readme-logo]: ./docs/readme-logo.png
[logo-url]: https://community.algolia.com/instantsearch.js/

## Table of contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Setup](#setup)
  - [From a CDN](#from-a-cdn)
  - [With npm, browserify, webpack](#with-npm-browserify-webpack)
- [Quick Start](#quick-start)
- [Browser support](#browser-support)
- [Instant search configuration](#instant-search-configuration)
  - [Number locale](#number-locale)
  - [Initial search parameters](#initial-search-parameters)
  - [URL synchronisation](#url-synchronisation)
- [Development workflow](#development-workflow)
- [Test](#test)
- [License](#license)
- [Contributing](#contributing)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Setup

### From a CDN

instantsearch.js is available on [jsDelivr](https://www.jsdelivr.com/) and [cdnjs](https://cdnjs.com):

To use cdn service from jsdelivr, try this example code below:
```html
<link rel="stylesheet" type="text/css" href="//cdn.jsdelivr.net/instantsearch.js/0/instantsearch.min.css" />
<script src="//cdn.jsdelivr.net/instantsearch.js/0/instantsearch.min.js"></script>
```

This is the example code for using cdn service from cdnjs.com:
```html
<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/instantsearch.js/1.0.0/instantsearch.min.css" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/instantsearch.js/1.0.0/instantsearch.min.js"></script>
```

### With npm, browserify, webpack

```sh
npm install instantsearch.js --save
```

## Quick Start

```js
var instantsearch = require('instantsearch.js');
// or use the 'instantsearch' global variable when using the jsDelivr build

var search = instantsearch({
  appId: appId, // Mandatory
  apiKey: apiKey, // Mandatory
  indexName: indexName, // Mandatory
  numberLocale: 'fr-FR' // Optional, defaults to 'en-EN',
  urlSync: { // optionnal, activate url sync if defined
    useHash: false
  }
});

// add a searchBox widget
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

## Development workflow

Only the local example:

```sh
npm run dev
# open http://localhost:8080
# make changes in your widgets, or in example/app.js
```

Local example and docs:

```sh
npm run dev:docs
# open http://localhost:4000/instantsearch.js/
```

## Test

```sh
npm test # jsdom + lint
npm run test:watch # jsdom
npm run test:watch:browser # chrome
npm run test:watch:browser -- --browsers ChromeCanary # force Chrome Canary
```

Most of the time `npm run test:watch` is sufficient.

## License

instantsearch.js is [MIT licensed](./LICENSE).

## Contributing

We have a [contributing guide](CONTRIBUTING.md), join us!
