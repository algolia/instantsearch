import React, { Component } from 'react';
import { connect } from 'react-redux';

import { setQuery } from './actions';

class SearchBox extends Component {
  onChange = e => {
    this.props.dispatch(setQuery(e.target.value));
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
