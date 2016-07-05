import React, { Component } from 'react';

import connect from './connect';
import { setQuery } from './actions';

class Hits extends Component {
  onChange = e => {
    this.props.dispatch(setQuery(e.target.value));
  };

  render() {
    return (
      <input
        type="text"
        value={this.props.state.helperState.query}
        onChange={this.onChange}
      />
    );
  }
}

export default connect(Hits);
