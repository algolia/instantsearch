import React, {Component} from 'react';
import {connect} from 'react-algoliasearch-helper';

import {stateManagerPropType, configManagerPropType} from './propTypes';

const hasOwnProperty = (...args) => ({}.hasOwnProperty.call(...args));

export default function createHOC(desc) {
  const hasConfigure = hasOwnProperty(desc, 'configure');
  const hasTransform = hasOwnProperty(desc, 'transformProps');
  const hasRefine = hasOwnProperty(desc, 'refine');

  const connector = connect(desc.mapStateToProps);

  return Composed => {
    class HOC extends Component {
      static displayName = desc.displayName || 'AlgoliaHOC';
      static propTypes = desc.propTypes;
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

      componentDidMount() {
        if (hasConfigure) {
          this.context.algoliaConfigManager.apply();
        }
      }

      componentWillUpdate(nextProps) {
        if (hasConfigure) {
          const nextConfigure = state => desc.configure(state, nextProps);
          this.context.algoliaConfigManager.swap(this.configure, nextConfigure);
          this.configure = nextConfigure;
        }
      }

      componentDidUpdate() {
        if (hasConfigure) {
          this.context.algoliaConfigManager.apply();
        }
      }

      componentWillUnmount() {
        if (hasConfigure) {
          this.context.algoliaConfigManager.unregister(this.configure);
        }
      }

      refine = (...args) => {
        const {helper} = this.props;
        const prevState = helper.getState();
        const nextState = desc.refine(prevState, this.props, ...args);
        this.context.algoliaStateManager.setState(nextState);
      };

      createURL = (...args) => {
        const {helper} = this.props;
        const prevState = helper.getState();
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
