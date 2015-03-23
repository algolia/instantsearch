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
 - Query batching

## What does it look like?

```javascript
var algoliaSearch = require( "algoliasearch" );
var Helper = require( "algoliasearch-helper" );

var client = algoliasearch( "GKDHJFHGN", "kfhjd02dsfklh" );

var helper = Helper( client, "myMainIndex", { 
  facets : ["mainCharacterFirstName", "year"],
  disjunctiveFacets : ["producer"]
});

helper.addDisjunctiveRefine( "director", "Clint Eastword" );
helper.addDisjunctiveRefine( "director", "Sofia Coppola" );

helper.addRefine( "year", "2003" );

// Search for any movie filmed in 2003 and directed by either C. Eastwood or S. Coppola
helper.search( "", function( err, data ){
  console.log( err ? "Error : " + data.message : data );
} );
```


