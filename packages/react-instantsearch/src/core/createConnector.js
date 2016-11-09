import React, {PropTypes, Component} from 'react';
import {omit, has} from 'lodash';

import {shallowEqual, getDisplayName} from './utils';

/**
 * @typedef {object} ConnectorDescription
 * @property {string} displayName - the displayName used by the wrapper
 * @property {function} refine - a function to filter the local state
 * @property {function} getSearchParameters - function transforming the local state to a SearchParameters
 * @property {function} getMetadata - metadata of the widget
 * @property {function} transitionState - hook after the state has changed
 * @property {function} getProps - transform the state into props passed to the wrapped component.
 * Receives (props, widgetStates, searchState, metadata) and returns the local state.
 * @property {object} propTypes - PropTypes forwarded to the wrapped component.
 * @property {object} defaultProps - default values for the props
 */

/**
 * Connectors are the HOC used to transform React components
 * into InstantSearch widgets.
 * In order to simplify the construction of such connectors
 * `createConnector` takes a description and transform it into
 * a connector.
 * @param {ConnectorDescription} connectorDesc the description of the connector
 * @return {Connector} a function that wraps a component into
 * an instantsearch connected one.
 */
export default function createConnector(connectorDesc) {
  if (!connectorDesc.displayName) {
    throw new Error(
      '`createConnector` requires you to provide a `displayName` property.'
    );
  }

  const hasRefine = has(connectorDesc, 'refine');
  const hasSearchParameters = has(connectorDesc, 'getSearchParameters');
  const hasMetadata = has(connectorDesc, 'getMetadata');
  const hasTransitionState = has(connectorDesc, 'transitionState');
  const isWidget = hasSearchParameters || hasMetadata || hasTransitionState;

  return Composed => class Connector extends Component {
    static displayName = `${connectorDesc.displayName}(${getDisplayName(Composed)})`;
    static defaultClassNames = Composed.defaultClassNames;
    static propTypes = __DOC__ === 'yes' ?
      {
        ...omit(Composed.propTypes, 'refine', 'createURL'),
        ...connectorDesc.propTypes,
      } :
      connectorDesc.propTypes;
    static defaultProps = connectorDesc.defaultProps;

    static contextTypes = {
      // @TODO: more precise state manager propType
      ais: PropTypes.object.isRequired,
    };

    constructor(props, context) {
      super(props, context);

      const {ais: {store, widgetsManager}} = context;

      this.state = {
        props: this.getProps(props),
      };

      this.unsubscribe = store.subscribe(() => {
        this.setState({
          props: this.getProps(this.props),
        });
      });

      const getSearchParameters = hasSearchParameters ?
        searchParameters =>
          connectorDesc.getSearchParameters(
            searchParameters,
            this.props,
            store.getState().widgets
          ) :
        null;
      const getMetadata = hasMetadata ?
        nextWidgetsState => connectorDesc.getMetadata(
          this.props,
          nextWidgetsState
        ) :
        null;
      const transitionState = hasTransitionState ?
        (prevWidgetsState, nextWidgetsState) => connectorDesc.transitionState(
          this.props,
          prevWidgetsState,
          nextWidgetsState
        ) :
        null;
      if (isWidget) {
        this.unregisterWidget = widgetsManager.registerWidget({
          getSearchParameters, getMetadata, transitionState,
        });
      }
    }

    componentWillReceiveProps(nextProps) {
      this.setState({
        props: this.getProps(nextProps),
      });

      if (isWidget) {
        // Since props might have changed, we need to re-run getSearchParameters
        // and getMetadata with the new props.
        this.context.ais.widgetsManager.update();
      }
    }

    componentWillUnmount() {
      this.unsubscribe();

      if (isWidget) {
        this.unregisterWidget();
      }
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
      const {ais: {store}} = this.context;
      const {
        results,
        searching,
        error,
        widgets,
        metadata,
      } = store.getState();
      const searchState = {results, searching, error};
      return connectorDesc.getProps.call(this, props, widgets, searchState, metadata);
    };

    refine = (...args) => {
      this.context.ais.onInternalStateUpdate(
        connectorDesc.refine(
          this.props,
          this.context.ais.store.getState().widgets,
          ...args
        )
      );
    };

    createURL = (...args) =>
      this.context.ais.createHrefForState(
        connectorDesc.refine(
          this.props,
          this.context.ais.store.getState().widgets,
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
