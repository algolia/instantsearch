import React, { PropTypes, Component } from 'react';
import shallowCompare from 'react-addons-shallow-compare';

export default function connect(mapToProps, helperProp = 'helper') {
  return Composed => {
    return class Connected extends Component {
      static contextTypes = {
        // @TODO: better classification
        algoliaStore: PropTypes.any.isRequired,
      };

      constructor(props, context) {
        super();

        this.state = mapToProps(context.algoliaStore.getState(), props);

        this.unsubscribe = context.algoliaStore.subscribe(() => {
          this.setState(
            mapToProps(context.algoliaStore.getState(), this.props)
          );
        });
      }

      componentWillUnmount() {
        this.unsubscribe();
      }

      shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState);
      }

      render() {
        return (
          <Composed
            {...this.props}
            {...this.state}
            {...{[helperProp]: this.context.algoliaStore.getHelper() }}
          />
        );
      }
    }
  };
}
