*Coming from V1 (or js client v2)?* Read the [migration guide](https://github.com/algolia/algoliasearch-helper-js/wiki/Migration-guide-:-V1-to-V2) to the new version of the Helper.

# algoliasearch-helper-js

This module is the companion of the algoliasearch-client-js. It helps you keep
track of the search parameters and provides a higher level API.

The helper is built on top of algoliasearch-client-js and this version is 
specifically made to work with the newest V3 versions of it.

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
