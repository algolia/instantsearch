import React, { Component } from 'react';
import connect from 'algoliasearch-helper-provider/src/connect';

class Hits extends Component {
  render() {
    return (
      <div>
        {this.props.searching && !this.props.searchResults && 'Loading...'}
        {this.props.searchResults && this.props.searchResults.hits.map(hit =>
          <div key={hit.objectID}>
            {hit.title}
          </div>
        )}
        {this.props.searchError && this.props.searchError}
      </div>
    );
  }
}

export default connect(state => ({
  searching: state.searching,
  searchResults: state.searchResults,
  searchError: state.searchError,
}))(Hits);
