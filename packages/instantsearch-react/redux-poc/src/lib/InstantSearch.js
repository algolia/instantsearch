import React, { Component, PropTypes, Children } from 'react';
import algoliasearch from 'algoliasearch';
import algoliasearchHelper from 'algoliasearch-helper';

import createStore from './createStore';

class InstantSearch extends Component {
  static childContextTypes = {
    // @TODO: better classification
    algoliaStore: PropTypes.any.isRequired,
  };

  constructor(props) {
    super(props);

    this.client = props.client || algoliasearch(props.appId, props.apiKey);
    this.helper = props.helper || algoliasearchHelper(this.client, props.indexName);
    this.store = createStore(this.helper);

    this.helper.search();
  }

  getChildContext() {
    return {
      algoliaStore: this.store,
    };
  }

  render() {
    return Children.only(this.props.children);
  }
}

export default InstantSearch;
