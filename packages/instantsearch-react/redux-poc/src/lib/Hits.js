import React, { Component } from 'react';

import connect from './connect';

class Hits extends Component {
  render() {
    return (
      <div>
        {this.props.state.result && this.props.state.result.hits.map(hit =>
          <div key={hit.objectID}>
            {hit.title}
          </div>
        )}
        {!this.props.state.result && 'Loading...'}
      </div>
    );
  }
}

export default connect(Hits);
