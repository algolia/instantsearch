import React, { Component } from 'react';
import isEqual from 'react-fast-compare';

import { InstantSearchConsumer, IndexConsumer } from './context';
import { shallowEqual, getDisplayName, removeEmptyKey } from './utils';

import type { InstantSearchContext, IndexContext } from './context';
import type { ElementType } from 'react';

export type ConnectorDescription = {
  displayName: string;
  $$type: string;
  /**
   * a function to filter the local state
   */
  refine?: (...args: any[]) => any;
  /**
   * function transforming the local state to a SearchParameters
   */
  getSearchParameters?: (...args: any[]) => any;
  /**
   * metadata of the widget (for current refinements)
   */
  getMetadata?: (...args: any[]) => any;
  /**
   * hook after the state has changed
   */
  transitionState?: (...args: any[]) => any;
  /**
   * transform the state into props passed to the wrapped component.
   * Receives (props, widgetStates, searchState, metadata) and returns the local state.
   */
  getProvidedProps: (...args: any[]) => any;
  /**
   * Receives props and return the id that will be used to identify the widget
   */
  getId?: (...args: any[]) => string;
  /**
   * hook when the widget will unmount. Receives (props, searchState) and return a cleaned state.
   */
  cleanUp?: (...args: any[]) => any;
  searchForFacetValues?: (...args: any[]) => any;
  shouldComponentUpdate?: (...args: any[]) => boolean;
  /**
   * PropTypes forwarded to the wrapped component.
   */
  propTypes?: Record<string, any>; // I can't find a definition for a propTypes object
  defaultProps?: Record<string, any>;
};

export type AdditionalWidgetProperties = {
  $$widgetType?: string;
};

type ConnectorProps = {
  contextValue: InstantSearchContext;
  indexContextValue?: IndexContext;
};

export type ConnectedProps<TWidgetProps> = TWidgetProps & ConnectorProps;

type ConnectorState = {
  providedProps: {};
};

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
export function createConnectorWithoutContext(
  connectorDesc: ConnectorDescription
) {
  if (!connectorDesc.displayName) {
    throw new Error(
      '`createConnector` requires you to provide a `displayName` property.'
    );
  }

  const isWidget =
    typeof connectorDesc.getSearchParameters === 'function' ||
    typeof connectorDesc.getMetadata === 'function' ||
    typeof connectorDesc.transitionState === 'function';

  return (
    Composed: ElementType,
    additionalWidgetProperties: AdditionalWidgetProperties = {}
  ) => {
    class Connector extends Component<ConnectorProps, ConnectorState> {
      static displayName = `${connectorDesc.displayName}(${getDisplayName(
        Composed
      )})`;
      static $$type = connectorDesc.$$type;
      static $$widgetType = additionalWidgetProperties.$$widgetType;
      static propTypes = connectorDesc.propTypes;
      static defaultProps = connectorDesc.defaultProps;
      static _connectorDesc = connectorDesc;

      unsubscribe?: () => void;
      unregisterWidget?: () => void;

      cleanupTimerRef: ReturnType<typeof setTimeout> | null = null;
      isUnmounting = false;

      state: ConnectorState = {
        providedProps: this.getProvidedProps(this.props),
      };

      constructor(props: ConnectorProps) {
        super(props);

        if (connectorDesc.getSearchParameters) {
          this.props.contextValue.onSearchParameters(
            connectorDesc.getSearchParameters.bind(this),
            {
              ais: this.props.contextValue,
              multiIndexContext: this.props.indexContextValue,
            },
            this.props,
            connectorDesc.getMetadata && connectorDesc.getMetadata.bind(this),
            connectorDesc.displayName
          );
        }
      }

      componentDidMount() {
        if (this.cleanupTimerRef) {
          clearTimeout(this.cleanupTimerRef);
          this.cleanupTimerRef = null;
        }

        this.unsubscribe = this.props.contextValue.store.subscribe(() => {
          if (!this.isUnmounting) {
            this.setState({
              providedProps: this.getProvidedProps(this.props),
            });
          }
        });

        if (isWidget) {
          this.unregisterWidget =
            this.props.contextValue.widgetsManager.registerWidget(this);
        }
      }

      shouldComponentUpdate(nextProps: any, nextState: any) {
        if (typeof connectorDesc.shouldComponentUpdate === 'function') {
          return connectorDesc.shouldComponentUpdate.call(
            this,
            this.props,
            nextProps,
            this.state,
            nextState
          );
        }

        const propsEqual = shallowEqual(this.props, nextProps);

        if (
          this.state.providedProps === null ||
          nextState.providedProps === null
        ) {
          if (this.state.providedProps === nextState.providedProps) {
            return !propsEqual;
          }
          return true;
        }

        return (
          !propsEqual ||
          !shallowEqual(this.state.providedProps, nextState.providedProps)
        );
      }

      componentDidUpdate(prevProps: any) {
        if (!isEqual(prevProps, this.props)) {
          this.setState({
            providedProps: this.getProvidedProps(this.props),
          });

          if (isWidget) {
            this.props.contextValue.widgetsManager.update();

            if (typeof connectorDesc.transitionState === 'function') {
              this.props.contextValue.onSearchStateChange(
                connectorDesc.transitionState.call(
                  this,
                  this.props,
                  this.props.contextValue.store.getState().widgets,
                  this.props.contextValue.store.getState().widgets
                )
              );
            }
          }
        }
      }

      componentWillUnmount() {
        this.cleanupTimerRef = setTimeout(() => {
          this.isUnmounting = true;

          if (this.unsubscribe) {
            this.unsubscribe();
          }

          if (this.unregisterWidget) {
            this.unregisterWidget();

            if (typeof connectorDesc.cleanUp === 'function') {
              const nextState = connectorDesc.cleanUp.call(
                this,
                this.props,
                this.props.contextValue.store.getState().widgets
              );

              this.props.contextValue.store.setState({
                ...this.props.contextValue.store.getState(),
                widgets: nextState,
              });

              this.props.contextValue.onSearchStateChange(
                removeEmptyKey(nextState)
              );
            }
          }
        });
      }

      getProvidedProps(props: any) {
        const {
          widgets,
          results,
          resultsFacetValues,
          searching,
          searchingForFacetValues,
          isSearchStalled,
          metadata,
          error,
        } = this.props.contextValue.store.getState();

        const searchResults = {
          results,
          searching,
          searchingForFacetValues,
          isSearchStalled,
          error,
        };

        return connectorDesc.getProvidedProps.call(
          this,
          props,
          widgets,
          searchResults,
          metadata,
          // @MAJOR: move this attribute on the `searchResults` it doesn't
          // makes sense to have it into a separate argument. The search
          // flags are on the object why not the results?
          resultsFacetValues
        );
      }

      getSearchParameters(searchParameters: any) {
        if (typeof connectorDesc.getSearchParameters === 'function') {
          return connectorDesc.getSearchParameters.call(
            this,
            searchParameters,
            this.props,
            this.props.contextValue.store.getState().widgets
          );
        }

        return null;
      }

      getMetadata(nextWidgetsState: any) {
        if (typeof connectorDesc.getMetadata === 'function') {
          return connectorDesc.getMetadata.call(
            this,
            this.props,
            nextWidgetsState
          );
        }

        return {};
      }

      transitionState(prevWidgetsState: any, nextWidgetsState: any) {
        if (typeof connectorDesc.transitionState === 'function') {
          return connectorDesc.transitionState.call(
            this,
            this.props,
            prevWidgetsState,
            nextWidgetsState
          );
        }

        return nextWidgetsState;
      }

      refine = (...args: any[]) => {
        this.props.contextValue.onInternalStateUpdate(
          // refine will always be defined here because the prop is only given conditionally
          connectorDesc.refine!.call(
            this,
            this.props,
            this.props.contextValue.store.getState().widgets,
            ...args
          )
        );
      };

      createURL = (...args: any[]) =>
        this.props.contextValue.createHrefForState(
          // refine will always be defined here because the prop is only given conditionally
          connectorDesc.refine!.call(
            this,
            this.props,
            this.props.contextValue.store.getState().widgets,
            ...args
          )
        );

      searchForFacetValues = (...args: any[]) => {
        this.props.contextValue.onSearchForFacetValues(
          // searchForFacetValues will always be defined here because the prop is only given conditionally
          connectorDesc.searchForFacetValues!.call(
            this,
            this.props,
            this.props.contextValue.store.getState().widgets,
            ...args
          )
        );
      };

      render() {
        const { contextValue, ...props } = this.props;
        const { providedProps } = this.state;

        if (providedProps === null) {
          return null;
        }

        const refineProps =
          typeof connectorDesc.refine === 'function'
            ? { refine: this.refine, createURL: this.createURL }
            : {};

        const searchForFacetValuesProps =
          typeof connectorDesc.searchForFacetValues === 'function'
            ? { searchForItems: this.searchForFacetValues }
            : {};

        return (
          <Composed
            {...props}
            {...providedProps}
            {...refineProps}
            {...searchForFacetValuesProps}
          />
        );
      }
    }

    return Connector;
  };
}

const createConnectorWithContext =
  (connectorDesc: ConnectorDescription) =>
  (
    Composed: ElementType,
    additionalWidgetProperties?: AdditionalWidgetProperties
  ) => {
    const Connector = createConnectorWithoutContext(connectorDesc)(
      Composed,
      additionalWidgetProperties
    );

    const ConnectorWrapper: React.FC<any> = (props) => (
      <InstantSearchConsumer>
        {(contextValue) => (
          <IndexConsumer>
            {(indexContextValue) => (
              <Connector
                contextValue={contextValue}
                indexContextValue={indexContextValue}
                {...props}
              />
            )}
          </IndexConsumer>
        )}
      </InstantSearchConsumer>
    );

    return ConnectorWrapper;
  };

export default createConnectorWithContext;
