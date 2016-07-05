import React, { Component, PropTypes } from 'react';
import algoliasearch from 'algoliasearch';
import algoliasearchHelper from 'algoliasearch-helper';

import createStore from './createStore';
import reducer from './reducer';
import { retrieveResultSuccess } from './actions';

import Hits from './Hits';

class InstantSearch extends Component {
  static childContextTypes = {
    store: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    // @TODO: accept an algoliasearch object instead?
    this.algoliasearch = algoliasearch(props.appId, props.apiKey);
    this.store = createStore(reducer, {
      helperState: this.createHelper().getState(),
      result: null,
    });
    this.unsubscribe = this.store.subscribe(this.search);
    this.prevHelperState = null;

    this.search();
  }

  componentWillUnmount() {
    // Not really useful since the store gets deleted with the Component anyway
    // since it is only defined inside of it (for now).
    this.unsubscribe();
  }

  getChildContext() {
    return {
      store: this.store,
    };
  }

  createHelper() {
    return algoliasearchHelper(
      this.algoliasearch,
      this.props.indexName
    );
  }

  search = () => {
    const { helperState } = this.store.getState();

    if (helperState === this.prevHelperState) {
      return;
    }
    this.prevHelperState = helperState;

    const helper = this.createHelper();
    helper.setState(helperState);
    helper.on('result', result => {
      this.store.dispatch(retrieveResultSuccess(result));
    });
    helper.search();
  };

  render() {
    return (
      // For now we support multiple children. If we were to act like a redux
      // provider, we'd only support a single child or none.
      <div>
        {this.props.children}
      </div>
    );
  }
}

export default InstantSearch;
