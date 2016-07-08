import React, { Component, PropTypes, Children } from 'react';
import algoliasearch from 'algoliasearch';
import algoliasearchHelper from 'algoliasearch-helper';
import Provider from 'algoliasearch-helper-provider/src/Provider';

import createConfigManager from './createConfigManager';
import configManagerShape from './configManagerShape';

class InstantSearch extends Component {
  static childContextTypes = {
    algoliaConfigManager: configManagerShape.isRequired,
  };

  constructor(props) {
    super(props);

    this.client = props.client || algoliasearch(props.appId, props.apiKey);
    this.helper = props.helper || algoliasearchHelper(this.client, props.indexName);

    this.configManager = createConfigManager(this.helper);
  }

  componentWillUnmount() {
    this.configManager.unbind();
  }

  getChildContext() {
    return {
      algoliaConfigManager: this.configManager,
    };
  }

  render() {
    const { client, helper, ...otherProps } = this.props;
    return <Provider {...otherProps} helper={this.helper} />;
  }
}

export default InstantSearch;
