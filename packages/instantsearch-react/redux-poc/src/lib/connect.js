import React, { Component, PropTypes } from 'react';

export default function connect(Composed) {
  return class Connected extends Component {
    static contextTypes = {
      store: PropTypes.object.isRequired,
    };

    constructor(props, context) {
      super();

      this.unsubscribe = context.store.subscribe(() => {
        this.forceUpdate();
      });
    }

    componentWillUnmount() {
      this.unsubscribe();
    }

    render() {
      return (
        <Composed
          dispatch={this.context.store.dispatch}
          state={this.context.store.getState()}
        />
      );
    }
  }
}
