import React, { Component } from 'react';
import connect from 'algoliasearch-helper-provider/src/connect';

class SearchBox extends Component {
  onChange = e => {
    this.props.helper.setQuery(e.target.value).search();
  };

  render() {
    return (
      <input
        type="text"
        value={this.props.query}
        onChange={this.onChange}
      />
    );
  }
}

export default connect(state => ({
  query: state.searchParameters.query,
}))(SearchBox);
