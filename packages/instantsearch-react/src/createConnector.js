import React, {PropTypes, Component} from 'react';
import {has} from 'lodash';

import {shallowEqual} from './utils';

export default function createConnector(connectorDesc) {
  if (!connectorDesc.displayName) {
    throw new Error(
      '`createConnector` requires you to provide a `displayName` property.'
    );
  }

  const hasRefine = has(connectorDesc, 'refine');
  const hasSearchParameters = has(connectorDesc, 'getSearchParameters');
  const hasMetadata = has(connectorDesc, 'getMetadata');

  return Composed => class Connector extends Component {
    static displayName = connectorDesc.displayName;
    static propTypes = connectorDesc.propTypes;
    static defaultProps = connectorDesc.defaultProps;

    static contextTypes = {
      // @TODO: more precise state manager propType
      aisStore: PropTypes.object.isRequired,
      aisWidgetsManager: PropTypes.object.isRequired,
    };

    constructor(props, context) {
      super(props, context);

      const {aisStore, aisWidgetsManager} = context;

      this.state = {
        props: this.getProps(props),
      };

      this.unsubscribe = aisStore.subscribe(() => {
        this.setState({
          props: this.getProps(this.props),
        });
      });

      const getSearchParameters = hasSearchParameters ?
        searchParameters =>
          connectorDesc.getSearchParameters(
            searchParameters,
            this.props,
            aisStore.getState().widgets
          ) :
        null;
      const getMetadata = hasMetadata ?
        nextWidgetsState => connectorDesc.getMetadata(
          this.props,
          nextWidgetsState
        ) :
        null;
      this.unregisterWidget = aisWidgetsManager.registerWidget({
        getSearchParameters, getMetadata,
      });
    }

    componentWillReceiveProps(nextProps) {
      this.setState({
        props: this.getProps(nextProps),
      });

      // Since props might have changed, we need to re-run transformer and
      // getMetadata with the new props.
      this.context.aisWidgetsManager.update();
    }

    componentWillUnmount() {
      this.unsubscribe();
      this.unregisterWidget();
    }

    shouldComponentUpdate(nextProps, nextState) {
      const propsEqual = shallowEqual(this.props, nextProps);
      if (this.state.props === null || nextState.props === null) {
        if (this.state.props === nextState.props) {
          return !propsEqual;
        }
        return true;
      }
      return !propsEqual || !shallowEqual(this.state.props, nextState.props);
    }

    getProps = props => {
      const {aisStore} = this.context;
      const {
        results,
        searching,
        error,
        widgets,
        metadata,
      } = aisStore.getState();
      const searchState = {results, searching, error};
      return connectorDesc.getProps(props, widgets, searchState, metadata);
    };

    refine = (...args) => {
      this.context.aisWidgetsManager.setState(
        connectorDesc.refine(
          this.props,
          this.context.aisStore.getState().widgets,
          ...args
        )
      );
    };

    createURL = (...args) =>
      this.context.aisWidgetsManager.getURLForState(
        connectorDesc.refine(
          this.props,
          this.context.aisStore.getState().widgets,
          ...args
        )
      );

    render() {
      if (this.state.props === null) {
        return null;
      }

      const refineProps = hasRefine ?
        {refine: this.refine, createURL: this.createURL} :
        {};
      return (
        <Composed
          {...this.props}
          {...this.state.props}
          {...refineProps}
        />
      );
    }
  };
}
