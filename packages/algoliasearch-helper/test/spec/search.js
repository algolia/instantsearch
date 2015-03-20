var test = require("tape");
var _ = require( "lodash" );
var sinon = require("sinon");
var algoliaSearch = require( "algoliasearch" );

var Helper = require( "../../index" );

test( "Search should call the algolia client according to the number of refinements", function( t ){
  var client = algoliaSearch( "dsf", "dsfdf" );

  var mock = sinon.mock( client );
  mock.expects( "startQueriesBatch" ).once();
  mock.expects( "addQueryInBatch" ).exactly( 2 );
  mock.expects( "sendQueriesBatch" ).once().yields( null,{"results":[{"hits":[{"name":"Hotel E","stars":"****","facilities":["spa"],"city":"New York","objectID":"366084010","_highlightResult":{"name":{"value":"Hotel E","matchLevel":"none","matchedWords":[]},"stars":{"value":"****","matchLevel":"none","matchedWords":[]},"facilities":[{"value":"spa","matchLevel":"none","matchedWords":[]}],"city":{"value":"New York","matchLevel":"none","matchedWords":[]}}},{"name":"Hotel D","stars":"****","facilities":["spa"],"city":"Paris","objectID":"366084000","_highlightResult":{"name":{"value":"Hotel D","matchLevel":"none","matchedWords":[]},"stars":{"value":"****","matchLevel":"none","matchedWords":[]},"facilities":[{"value":"spa","matchLevel":"none","matchedWords":[]}],"city":{"value":"Paris","matchLevel":"none","matchedWords":[]}}},{"name":"Hotel B","stars":"*","facilities":["wifi"],"city":"Paris","objectID":"366083980","_highlightResult":{"name":{"value":"Hotel B","matchLevel":"none","matchedWords":[]},"stars":{"value":"*","matchLevel":"none","matchedWords":[]},"facilities":[{"value":"wifi","matchLevel":"none","matchedWords":[]}],"city":{"value":"Paris","matchLevel":"none","matchedWords":[]}}},{"name":"Hotel A","stars":"*","facilities":["wifi","bath","spa"],"city":"Paris","objectID":"366083970","_highlightResult":{"name":{"value":"Hotel A","matchLevel":"none","matchedWords":[]},"stars":{"value":"*","matchLevel":"none","matchedWords":[]},"facilities":[{"value":"wifi","matchLevel":"none","matchedWords":[]},{"value":"bath","matchLevel":"none","matchedWords":[]},{"value":"spa","matchLevel":"none","matchedWords":[]}],"city":{"value":"Paris","matchLevel":"none","matchedWords":[]}}}],"nbHits":4,"page":0,"nbPages":1,"hitsPerPage":20,"processingTimeMS":1,"query":"","params":"query=&hitsPerPage=20&page=0&facets=%5B%5D&facetFilters=%5B%5B%22city%3AParis%22%2C%22city%3ANew%20York%22%5D%5D","index":"test_hotels-node"},{"hits":[{"objectID":"366084010"}],"nbHits":5,"page":0,"nbPages":5,"hitsPerPage":1,"processingTimeMS":1,"facets":{"city":{"Paris":3,"New York":1,"San Francisco":1}},"query":"","params":"query=&hitsPerPage=1&page=0&attributesToRetrieve=%5B%5D&attributesToHighlight=%5B%5D&attributesToSnippet=%5B%5D&facets=city&facetFilters=%5B%5D","index":"test_hotels-node"}]} );

  var helper = Helper( client, "test_hotels-node", {
    disjunctiveFacets : ["city"]
  });
  helper.addDisjunctiveRefine( "city", "Paris" );
  helper.addDisjunctiveRefine( "city", "New York" );
  helper.search( "", function( isSuccess, data ) {
    t.ok( _.isEqual( data, {"hits":[{"name":"Hotel E","stars":"****","facilities":["spa"],"city":"New York","objectID":"366084010","_highlightResult":{"name":{"value":"Hotel E","matchLevel":"none","matchedWords":[]},"stars":{"value":"****","matchLevel":"none","matchedWords":[]},"facilities":[{"value":"spa","matchLevel":"none","matchedWords":[]}],"city":{"value":"New York","matchLevel":"none","matchedWords":[]}}},{"name":"Hotel D","stars":"****","facilities":["spa"],"city":"Paris","objectID":"366084000","_highlightResult":{"name":{"value":"Hotel D","matchLevel":"none","matchedWords":[]},"stars":{"value":"****","matchLevel":"none","matchedWords":[]},"facilities":[{"value":"spa","matchLevel":"none","matchedWords":[]}],"city":{"value":"Paris","matchLevel":"none","matchedWords":[]}}},{"name":"Hotel B","stars":"*","facilities":["wifi"],"city":"Paris","objectID":"366083980","_highlightResult":{"name":{"value":"Hotel B","matchLevel":"none","matchedWords":[]},"stars":{"value":"*","matchLevel":"none","matchedWords":[]},"facilities":[{"value":"wifi","matchLevel":"none","matchedWords":[]}],"city":{"value":"Paris","matchLevel":"none","matchedWords":[]}}},{"name":"Hotel A","stars":"*","facilities":["wifi","bath","spa"],"city":"Paris","objectID":"366083970","_highlightResult":{"name":{"value":"Hotel A","matchLevel":"none","matchedWords":[]},"stars":{"value":"*","matchLevel":"none","matchedWords":[]},"facilities":[{"value":"wifi","matchLevel":"none","matchedWords":[]},{"value":"bath","matchLevel":"none","matchedWords":[]},{"value":"spa","matchLevel":"none","matchedWords":[]}],"city":{"value":"Paris","matchLevel":"none","matchedWords":[]}}}],"nbHits":4,"page":0,"nbPages":1,"hitsPerPage":20,"processingTimeMS":1,"query":"","params":"query=&hitsPerPage=20&page=0&facets=%5B%5D&facetFilters=%5B%5B%22city%3AParis%22%2C%22city%3ANew%20York%22%5D%5D","index":"test_hotels-node","disjunctiveFacets":{"city":{"Paris":3,"New York":1,"San Francisco":1}},"facetStats":{}} ) , "should be equal" );

  t.ok( mock.verify(), "" );
  t.end();
} );
} );
