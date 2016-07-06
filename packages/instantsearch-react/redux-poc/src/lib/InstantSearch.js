import React, { Component, PropTypes } from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import algoliasearch from 'algoliasearch';
import algoliasearchHelper from 'algoliasearch-helper';

import createReducer from './createReducer';
import { retrieveResultSuccess, search } from './actions';

import Hits from './Hits';

class InstantSearch extends Component {
  static childContextTypes = {
    // @TODO: better classification
    algoliasearchClient: PropTypes.any.isRequired,
  };

  constructor(props) {
    super(props);

    this.store = createStore(
      createReducer(props.indexName),
      applyMiddleware(thunk, createLogger())
    );
    this.unsubscribe = this.store.subscribe(this.search);
    this.prevSearchParameters = null;

    this.client = algoliasearch(props.appId, props.apiKey);

    this.search();
  }

  componentWillUnmount() {
    // Is this needed? The store should get deleted with the component anyway
    // since its only reference is inside of it and its children.
    this.unsubscribe();
  }

  getChildContext() {
    return {
      algoliasearchClient: this.client,
    };
  }

  search = () => {
    const { searchParameters } = this.store.getState();
    if (searchParameters === this.prevSearchParameters) {
      return;
    }
    this.prevSearchParameters = searchParameters;

    this.store.dispatch(search(this.client));
  };

  render() {
    const { appId, apiKey, indexName, ...otherProps } = this.props;
    return (
      // For now we support multiple children. If we were to act like a redux
      // provider, we'd only support a single child or none.
      <Provider {...otherProps} store={this.store} />
    );
  }
}

export default InstantSearch;
