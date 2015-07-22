var InstantSearch = require('./lib/InstantSearch');
var SearchBox = require('./components/SearchBox');
var Results = require('./components/Results');
var React = require( "react" );

module.exports = {
  InstantSearch : InstantSearch,
  widgets: {
    searchbox: require('widgets/searchbox'),
    results: require('widgets/hits')
  }
}
