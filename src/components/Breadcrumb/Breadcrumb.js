import React, { PureComponent } from 'react';

class Breadcrumb extends PureComponent {
  render() {
    return (
      <pre>
        {JSON.stringify(this.props, null, 4)}
      </pre>
    );
  }
}

export default Breadcrumb;
