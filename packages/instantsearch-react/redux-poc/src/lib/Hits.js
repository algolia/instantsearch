import React, { Component } from 'react';
import { connect } from 'react-redux';

class Hits extends Component {
  render() {
    return (
      <div>
        {this.props.searchResults && this.props.searchResults.hits.map(hit =>
          <div key={hit.objectID}>
            {hit.title}
          </div>
        )}
        {!this.props.searchResults && 'Loading...'}
      </div>
    );
  }
}

export default connect(state => ({
  searchResults: state.searchResults,
}))(Hits);
