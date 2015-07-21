"use strict";
var React = require( "react" );
var map = require( "lodash/collection/map" );

var Hogan = require( "../Hogan" );

var paginationLabels = {
  next : "next",
  previous : "previous"
};

class Results extends React.Component {
  render() {
    var results = this.props.results;
    if( !results || !results.hits || results.hits.length === 0 ) {
      return this.renderNoResults( results, this.props.noResultsTemplate );
    }
    return this.renderWithResults( results.hits, this.props.hitTemplate );
  }
  renderWithResults( hits, hitTemplate ) {
    var renderedHits = map( hits, function( hit ) {
      return <Hogan data={ hit } key={ hit.objectID } template={ hitTemplate } />;
    } );
    return <div className="search_list search_results_container row">{ renderedHits }</div>
  }
  renderNoResults( results, noResultsTemplate ) {
    return  <div className="search_list search_results_container row">
              <Hogan data={ results } template={ noResultsTemplate } />
            </div>;
  }
}

module.exports = Results;
