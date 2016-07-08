import React, { Component } from 'react';
import connect from 'algoliasearch-helper-provider/src/connect';

class DefaultHitComponent extends Component {
  render() {
    return (
      <div>
        {JSON.stringify(this.props.hit)}
      </div>
    );
  }
}

class Hits extends Component {
  static defaultProps = {
    itemComponent: DefaultHitComponent,
  };

  render() {
    const { itemComponent: ItemComponent } = this.props;

    return (
      <div>
        {this.props.searching && !this.props.searchResults && 'Loading...'}
        {this.props.searchResults && this.props.searchResults.hits.map(hit =>
          <ItemComponent key={hit.objectID} hit={hit} />
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
