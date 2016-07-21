import React, {PropTypes, Component} from 'react';
import algoliasearch from 'algoliasearch';
import algoliasearchHelper, {SearchParameters} from 'algoliasearch-helper';
import {Provider} from 'react-algoliasearch-helper';
import omit from 'lodash/object/omit';
import isEqual from 'lodash/lang/isEqual';
import {createHistory, useQueries} from 'history';
import qs from 'qs';

import createConfigManager from './createConfigManager';
import createStateManager from './createStateManager';
import {configManagerPropType, stateManagerPropType} from './propTypes';

class InstantSearch extends Component {
  static propTypes = {
    // @FIX: a few of these props are only applied on component initialization
    // and can't be updated afterwards. appId, apiKey, history, treshold...
    appId: PropTypes.string,
    apiKey: PropTypes.string,
    indexName: PropTypes.string,
    history: PropTypes.object,
    createURL: PropTypes.func,
    treshold: PropTypes.number,
    configureState: PropTypes.func,
  };

  static defaultProps = {
    treshold: 700,
  };

  static childContextTypes = {
    algoliaConfigManager: configManagerPropType.isRequired,
    algoliaStateManager: stateManagerPropType.isRequired,
  };

  constructor(props) {
    super(props);

    const client = algoliasearch(props.appId, props.apiKey);
    const helper = this.helper = algoliasearchHelper(client, props.indexName);

    const history = props.history || useQueries(createHistory)({
      parseQueryString: qs.parse,
      stringifyQuery: qs.stringify,
    });

    // The helper that is passed down to our components is not the actual helper
    // we use for searching. The reasoning behind that is that:
    // 1) We need to apply default parameters before every search, without those
    // parameters being reflected in the helper's state that is passed to
    // components through the Provider.
    // 2) Those default parameters must not be persisted to the URL.
    const masterHelper = algoliasearchHelper(client, props.indexName);
    masterHelper.on('result', (...args) => {
      // The result listeners will be passed the actual searchParameters for the
      // fetched searchResults, with the default parameters applied.
      // So while the default parameters will be absent from the algolia store's
      // `searchParameters` property, they will be present in its
      // `searchResultsSearchParameters` property.
      helper.emit('result', ...args);
    });
    masterHelper.on('error', (...args) => {
      helper.emit('error', ...args);
    });

    let searchQueued = false;
    const debouncedSearch = this.debouncedSearch = () => {
      if (searchQueued) {
        return;
      }
      process.nextTick(() => {
        searchQueued = false;
        const state = helper.getState();
        const configuredState = this.configManager.getState(state);
        if (isEqual(configuredState, masterHelper.getState())) {
          // Otherwise we have an infinite loop of:
          // search -> re-render -> re-configure -> search
          // There might be a better way to avoid this than deep equality check.
          // This is kinda sad: since our helper states are immutable, deep
          // equality check could be free.
          // Note that there might still be infinite loops if two components'
          // configs are inter-dependent.
          return;
        }
        masterHelper.setState(configuredState);
        masterHelper.search();
        helper.emit('search', state);
      });
    };

    this.configManager = createConfigManager(debouncedSearch);

    this.stateManager = createStateManager(history, () => {
      let state = new SearchParameters({
        ...this.stateManager.getState(),
        index: props.indexName,
      });
      if (this.props.configureState) {
        // Note that the configureState might be out of date when using
        // React Router. Route components will only get their new params props
        // once all history listeners have been called, so if a configureState
        // depends on params, it will first be called with the old params,
        // then with the new params once the component has re-rendered.
        // Thanks to our debounced search, we'll only end up making one request.
        // See also componentWillReceiveProps.
        state = this.props.configureState(state);
      }
      // We trigger a state update in our components, and we wait for them to
      // update their configs before actually triggering the search.
      // This is different from the config manager onUpdate since a state change
      // will trigger a re-render instantly, while a config change will only
      // trigger a re-render once new search results have been fetched.
      helper.setState(state);
      debouncedSearch();
    }, {
      createURL: props.createURL,
      treshold: props.treshold,
    });

    // Retrieve the initial state from the history.
    let initialState = new SearchParameters({
      ...this.stateManager.getState(),
      index: props.indexName,
    });
    if (props.configureState) {
      initialState = props.configureState(initialState);
    }
    helper.setState(initialState);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.configureState) {
      // Since configureState might depend on the parent's props and/or state,
      // and/or might just change completely between renders, we need to update
      // the state on every render of this component.
      this.helper.setState(nextProps.configureState(
        new SearchParameters({
          ...this.stateManager.getState(),
          index: nextProps.indexName,
        })
      ));
      this.debouncedSearch();
    }
  }

  componentWillUnmount() {
    this.stateManager.unlisten();
  }

  getChildContext() {
    return {
      algoliaConfigManager: this.configManager,
      algoliaStateManager: this.stateManager,
    };
  }

  render() {
    return (
      <Provider
        {...omit(this.props, Object.keys(InstantSearch.propTypes))}
        helper={this.helper}
      />
    );
  }
}

export default InstantSearch;
