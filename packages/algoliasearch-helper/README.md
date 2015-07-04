*Coming from V1 (or js client v2)?* Read the [migration guide](https://github.com/algolia/algoliasearch-helper-js/wiki/Migration-guide-:-V1-to-V2) to the new version of the Helper.

# algoliasearch-helper-js

This module is the companion of the [algolia/algoliasearch-client-js](https://github.com/algolia/algoliasearch-client-js). It helps you keep
track of the search parameters and provides a higher level API.

This is the library you will need to easily build a good search UX like our [instant search demo](http://demos.algolia.com/instant-search-demo/).

[![Version][version-svg]][package-url] [![Build Status][travis-svg]][travis-url] [![License][license-image]][license-url] [![Downloads][downloads-image]][downloads-url]

[![Browser tests][browser-test-matrix]][browser-test-url]

[travis-svg]: https://img.shields.io/travis/algolia/algoliasearch-helper-js/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/algolia/algoliasearch-helper-js
[license-image]: http://img.shields.io/badge/license-MIT-green.svg?style=flat-square
[license-url]: LICENSE
[downloads-image]: https://img.shields.io/npm/dm/algoliasearch-helper.svg?style=flat-square
[downloads-url]: http://npm-stat.com/charts.html?package=algoliasearch-helper
[browser-test-matrix]: https://saucelabs.com/browser-matrix/as-helper-js.svg
[browser-test-url]: https://saucelabs.com/u/as-helper-js
[version-svg]: https://img.shields.io/npm/v/algoliasearch-helper.svg?style=flat-square
[package-url]: https://npmjs.org/package/algoliasearch-helper

## Features
 - Search parameters tracking
 - Facets exclusions
 - Pagination
 - Disjunctive facetting (search on two or more values for a single facet)

## What does it look like?

A small example that uses Browserify to manage modules.

```javascript
var algoliasearch = require( "algoliasearch" );
var algoliasearchHelper = require( "algoliasearch-helper" );

var client = algoliasearch( "app_id", "secret" );

var helper = algoliasearchHelper( client, "myMainIndex", { 
  facets : [ "mainCharacterFirstName", "year" ],
  disjunctiveFacets : [ "director" ]
});

helper.on( "result", function( data ){
  console.log( data.hits );
} );

helper.addDisjunctiveRefine( "director", "Clint Eastword" );
helper.addDisjunctiveRefine( "director", "Sofia Coppola" );

helper.addNumericRefinement( "year", "=", 2003 );

// Search for any movie filmed in 2003 and directed by either C. Eastwood or S. Coppola
helper.search();
```

## How to use this module

[Have a look at the JSDoc](http://algolia.github.io/algoliasearch-helper-js/docs)

[See the examples in action](http://algolia.github.io/algoliasearch-helper-js/)

### Use with NPM

`npm install algoliasearch-helper`

### Use with bower

`bower install algoliasearch-helper`

### Use the CDN

Include this in your page :

`<script src="//cdn.jsdelivr.net/algoliasearch.helper/2.0.0/algoliasearch.helper.min.js"></script>`

## How to contribute?

See [CONTRIBUTING.md](./CONTRIBUTING.md).
