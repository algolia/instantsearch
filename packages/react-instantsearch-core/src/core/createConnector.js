import { has, isEqual, find } from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { shallowEqual, getDisplayName, removeEmptyKey } from './utils';

/**
 * @typedef {object} ConnectorDescription
 * @property {string} displayName - the displayName used by the wrapper
 * @property {function} refine - a function to filter the local state
 * @property {function} getSearchParameters - function transforming the local state to a SearchParameters
 * @property {function} getMetadata - metadata of the widget
 * @property {function} transitionState - hook after the state has changed
 * @property {function} getProvidedProps - transform the state into props passed to the wrapped component.
 * Receives (props, widgetStates, searchState, metadata) and returns the local state.
 * @property {function} getId - Receives props and return the id that will be used to identify the widget
 * @property {function} cleanUp - hook when the widget will unmount. Receives (props, searchState) and return a cleaned state.
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
  const hasSearchForFacetValues = has(connectorDesc, 'searchForFacetValues');
  const hasSearchParameters = has(connectorDesc, 'getSearchParameters');
  const hasMetadata = has(connectorDesc, 'getMetadata');
  const hasTransitionState = has(connectorDesc, 'transitionState');
  const hasCleanUp = has(connectorDesc, 'cleanUp');
  const hasShouldComponentUpdate = has(connectorDesc, 'shouldComponentUpdate');
  const isWidget = hasSearchParameters || hasMetadata || hasTransitionState;

  return Composed =>
    class Connector extends Component {
      static displayName = `${connectorDesc.displayName}(${getDisplayName(
        Composed
      )})`;
      static defaultClassNames = Composed.defaultClassNames;
      static propTypes = connectorDesc.propTypes;
      static defaultProps = connectorDesc.defaultProps;

      static contextTypes = {
        // @TODO: more precise state manager propType
        ais: PropTypes.object.isRequired,
        multiIndexContext: PropTypes.object,
      };

      mounted = false;
      unmounting = false;

      constructor(...args) {
        super(...args);

        this.state = {
          props: this.getProvidedProps({
            ...this.props,
            // @MAJOR: We cannot drop this beacuse it's a breaking change. The
            // prop is provided to `createConnector.getProvidedProps`. All the
            // custom connectors are impacted by this change. It should be fine
            // to drop it in the next major though.
            canRender: false,
          }),
        };

        if (process.env.NODE_ENV === 'development') {
          const onlyGetProvidedPropsUsage = !find(
            Object.keys(connectorDesc),
            key =>
              [
                'getMetadata',
                'getSearchParameters',
                'refine',
                'cleanUp',
              ].indexOf(key) > -1
          );

          if (
            onlyGetProvidedPropsUsage &&
            connectorDesc.displayName.substr(0, 7) !== 'Algolia'
          ) {
            // eslint-disable-next-line no-console
            console.warn(
              'react-instantsearch: it seems that you are using the `createConnector` api ' +
                'only to access the `searchState` and the `searchResults` through `getProvidedProps`.' +
                'We are now provided a dedicated API' +
                ' the `connectStateResults` connector that you should use instead. The `createConnector` API will be ' +
                'soon deprecated and will break in future next major versions.' +
                '\n\n' +
                'See more at https://www.algolia.com/doc/api-reference/widgets/state-results/react/' +
                '\n' +
                'and https://www.algolia.com/doc/guides/building-search-ui/going-further/conditional-display/react/'
            );
          }
        }
      }

      componentWillMount() {
        if (connectorDesc.getSearchParameters) {
          this.context.ais.onSearchParameters(
            connectorDesc.getSearchParameters.bind(this),
            this.context,
            this.props
          );
        }
      }

      componentDidMount() {
        this.mounted = true;

        this.unsubscribe = this.context.ais.store.subscribe(() => {
          if (!this.unmounting) {
            this.setState({
              props: this.getProvidedProps({
                ...this.props,
                // @MAJOR: see constructor
                canRender: true,
              }),
            });
          }
        });

        if (isWidget) {
          this.unregisterWidget = this.context.ais.widgetsManager.registerWidget(
            this
          );
        }
      }

      componentWillReceiveProps(nextProps) {
        if (!isEqual(this.props, nextProps)) {
          this.setState({
            props: this.getProvidedProps({
              ...nextProps,
              // @MAJOR: see constructor
              canRender: this.mounted,
            }),
          });

          if (isWidget) {
            this.context.ais.widgetsManager.update();

            if (connectorDesc.transitionState) {
              this.context.ais.onSearchStateChange(
                connectorDesc.transitionState.call(
                  this,
                  nextProps,
                  this.context.ais.store.getState().widgets,
                  this.context.ais.store.getState().widgets
                )
              );
            }
          }
        }
      }

      shouldComponentUpdate(nextProps, nextState) {
        if (hasShouldComponentUpdate) {
          return connectorDesc.shouldComponentUpdate.call(
            this,
            this.props,
            nextProps,
            this.state,
            nextState
          );
        }

        const propsEqual = shallowEqual(this.props, nextProps);

        if (this.state.props === null || nextState.props === null) {
          if (this.state.props === nextState.props) {
            return !propsEqual;
          }
          return true;
        }

        return !propsEqual || !shallowEqual(this.state.props, nextState.props);
      }

      componentWillUnmount() {
        this.unmounting = true;

        if (this.unsubscribe) {
          this.unsubscribe();
        }

        if (this.unregisterWidget) {
          this.unregisterWidget();

          if (hasCleanUp) {
            const nextState = connectorDesc.cleanUp.call(
              this,
              this.props,
              this.context.ais.store.getState().widgets
            );

            this.context.ais.store.setState({
              ...this.context.ais.store.getState(),
              widgets: nextState,
            });

            this.context.ais.onSearchStateChange(removeEmptyKey(nextState));
          }
        }
      }

      getProvidedProps(props) {
        const {
          widgets,
          results,
          resultsFacetValues,
          searching,
          searchingForFacetValues,
          isSearchStalled,
          metadata,
          error,
        } = this.context.ais.store.getState();

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
          // flags are on the object why not the resutls?
          resultsFacetValues
        );
      }

      getSearchParameters(searchParameters) {
        if (hasSearchParameters) {
          return connectorDesc.getSearchParameters.call(
            this,
            searchParameters,
            this.props,
            this.context.ais.store.getState().widgets
          );
        }

        return null;
      }

      getMetadata(nextWidgetsState) {
        if (hasMetadata) {
          return connectorDesc.getMetadata.call(
            this,
            this.props,
            nextWidgetsState
          );
        }

        return {};
      }

      transitionState(prevWidgetsState, nextWidgetsState) {
        if (hasTransitionState) {
          return connectorDesc.transitionState.call(
            this,
            this.props,
            prevWidgetsState,
            nextWidgetsState
          );
        }

        return nextWidgetsState;
      }

      refine = (...args) => {
        this.context.ais.onInternalStateUpdate(
          connectorDesc.refine.call(
            this,
            this.props,
            this.context.ais.store.getState().widgets,
            ...args
          )
        );
      };

      createURL = (...args) =>
        this.context.ais.createHrefForState(
          connectorDesc.refine.call(
            this,
            this.props,
            this.context.ais.store.getState().widgets,
            ...args
          )
        );

      searchForFacetValues = (...args) => {
        this.context.ais.onSearchForFacetValues(
          connectorDesc.searchForFacetValues(
            this.props,
            this.context.ais.store.getState().widgets,
            ...args
          )
        );
      };

      render() {
        if (this.state.props === null) {
          return null;
        }

        const refineProps = hasRefine
          ? { refine: this.refine, createURL: this.createURL }
          : {};

        const searchForFacetValuesProps = hasSearchForFacetValues
          ? { searchForItems: this.searchForFacetValues }
          : {};

        return (
          <Composed
            {...this.props}
            {...this.state.props}
            {...refineProps}
            {...searchForFacetValuesProps}
          />
        );
      }
    };
}
