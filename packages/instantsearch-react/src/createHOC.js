import React, {Component} from 'react';
import {connect} from 'react-algoliasearch-helper';

import {applyDefaultProps} from './utils';
import {stateManagerPropType, configManagerPropType} from './propTypes';

const hasOwnProperty = (...args) => ({}.hasOwnProperty.call(...args));

export default function createHOC(desc) {
  const hasConfigure = hasOwnProperty(desc, 'configure');
  const hasTransform = hasOwnProperty(desc, 'transformProps');
  const hasRefine = hasOwnProperty(desc, 'refine');

  // While react-redux does not  apply default props to the props passed to the
  // mapStateToProps method, we often find ourselves depending on default props
  // being set in the mapStateToProps.
  // A better way to do this might just be to create another component on top
  // of the connected one.
  const connector = connect((state, props) => desc.mapStateToProps(
    state,
    applyDefaultProps(props, desc.defaultProps)
  ));

  return Composed => {
    class HOC extends Component {
      static displayName = desc.displayName || 'AlgoliaHOC';
      static propTypes = desc.propTypes;
      // While we've already applied default props to the props passed to
      // connect, they haven't replaced the actual props object, so we need to
      // apply them a second time.
      static defaultProps = desc.defaultProps;

      static contextTypes = {
        algoliaConfigManager: configManagerPropType.isRequired,
        algoliaStateManager: stateManagerPropType.isRequired,
      };

      constructor(props, context) {
        super();

        if (hasConfigure) {
          this.configure = state => desc.configure(state, props);
          context.algoliaConfigManager.register(this.configure);
        }
      }

      componentWillUpdate(nextProps) {
        if (hasConfigure) {
          const nextConfigure = state => desc.configure(state, nextProps);
          this.context.algoliaConfigManager.swap(this.configure, nextConfigure);
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
        const nextState = desc.refine(prevState, this.props, ...args);
        this.context.algoliaStateManager.setState(nextState);
      };

      createURL = (...args) => {
        const prevState = this.context.algoliaStateManager.getState();
        const nextState = desc.refine(prevState, this.props, ...args);
        return this.context.algoliaStateManager.createURL(nextState);
      };

      render() {
        const transformedProps = hasTransform ?
          desc.transformProps(this.props) :
          this.props;
        const refineProps = hasRefine ?
          {refine: this.refine, createURL: this.createURL} :
          {};
        return (
          <Composed
            {...refineProps}
            {...transformedProps}
          />
        );
      }
    }

    return connector(HOC);
  };
}
