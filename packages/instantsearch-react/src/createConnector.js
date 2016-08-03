import React, {Component} from 'react';
import {connect} from 'react-algoliasearch-helper';
import has from 'lodash/object/has';

import {stateManagerPropType, configManagerPropType} from './propTypes';

const ORIGINAL_PROPS_KEY = '__original';

export default function createConnector(connectorDesc) {
  return (adapterDesc = {}) => {
    const hasConfigure = has(connectorDesc, 'configure');
    const hasTransform = has(connectorDesc, 'transformProps');
    const hasRefine = has(connectorDesc, 'refine');
    const hasMapProps = has(adapterDesc, 'mapPropsToConfig');

    // While react-redux does not  apply default props to the props passed to
    // the mapStateToProps method, we often find ourselves depending on default
    // props being set in the mapStateToProps.
    // A better way to do this might just be to create another component on top
    // of the connected one.
    const connector = connect((state, props) => {
      const customProps = hasMapProps ?
        adapterDesc.mapPropsToConfig(props) : props;
      return {
        // Keep track of the original props.
        // The HOC's props are more of a configuration/state store, which we
        // don't want to transfer to the composed component.
        [ORIGINAL_PROPS_KEY]: props,
        ...customProps,
        ...connectorDesc.mapStateToProps(state, customProps),
      };
    });

    return Composed => {
      class HOC extends Component {
        static displayName = connectorDesc.displayName || 'AlgoliaHOC';
        static propTypes = connectorDesc.propTypes;

        static contextTypes = {
          algoliaConfigManager: configManagerPropType.isRequired,
          algoliaStateManager: stateManagerPropType.isRequired,
        };

        constructor(props, context) {
          super();

          if (hasConfigure) {
            this.configure = state => connectorDesc.configure(state, props);
            context.algoliaConfigManager.register(this.configure);
          }
        }

        componentWillUpdate(nextProps) {
          if (hasConfigure) {
            const nextConfigure = state => connectorDesc.configure(state, nextProps);
            this.context.algoliaConfigManager.swap(
              this.configure,
              nextConfigure
            );
            this.configure = nextConfigure;
          }
        }

        componentWillUnmount() {
          if (hasConfigure) {
            this.context.algoliaConfigManager.unregister(this.configure);
          }
        }

        refine = (...args) => {
          const prevState = this.context.algoliaStateManager.getState();
          const nextState = connectorDesc.refine(
            prevState,
            this.props,
            ...args
          );
          this.context.algoliaStateManager.setState(nextState);
        };

        createURL = (...args) => {
          const prevState = this.context.algoliaStateManager.getState();
          const nextState = connectorDesc.refine(
            prevState,
            this.props,
            ...args
          );
          return this.context.algoliaStateManager.createURL(nextState);
        };

        render() {
          // The `transformProps` methods allows for passing new props to the
          // composed component that are derived from the HOC's own props.
          const transformedProps = hasTransform ?
            connectorDesc.transformProps(this.props) :
            this.props;
          const refineProps = hasRefine ?
            {refine: this.refine, createURL: this.createURL} :
            {};
          return (
            <Composed
              {...this.props[ORIGINAL_PROPS_KEY]}
              {...refineProps}
              {...transformedProps}
            />
          );
        }
      }

      const Connected = connector(HOC);

      Connected.defaultProps = {
        ...connectorDesc.defaultProps,
        ...adapterDesc.defaultProps,
      };

      return Connected;
    };
  };
}
