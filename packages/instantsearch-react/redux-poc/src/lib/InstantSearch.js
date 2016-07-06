import React, { Component, PropTypes, Children } from 'react';
import algoliasearch from 'algoliasearch';
import algoliasearchHelper from 'algoliasearch-helper';
import Provider from 'algoliasearch-helper-provider/src/Provider';

class InstantSearch extends Component {
  constructor(props) {
    super(props);

    this.client = props.client || algoliasearch(props.appId, props.apiKey);
    this.helper = props.helper || algoliasearchHelper(this.client, props.indexName);

    this.helper.search();
  }

  render() {
    const { client, helper, ...otherProps } = this.props;
    return <Provider {...otherProps} helper={this.helper} />;
  }
}

export default InstantSearch;
