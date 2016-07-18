import React, {PropTypes, Component} from 'react';
import algoliasearch from 'algoliasearch';
import algoliasearchHelper from 'algoliasearch-helper';
import {Provider} from 'react-algoliasearch-helper';
import omit from 'lodash/object/omit';

import createConfigManager from './createConfigManager';
import configManagerShape from './configManagerShape';

class InstantSearch extends Component {
  static propTypes = {
    appId: PropTypes.string,
    apiKey: PropTypes.string,
    indexName: PropTypes.string,
  };

  static childContextTypes = {
    algoliaConfigManager: configManagerShape.isRequired,
  };

  constructor(props) {
    super(props);

    const client = algoliasearch(props.appId, props.apiKey);
    const helper = this.helper = algoliasearchHelper(client, props.indexName);

    this.configManager = createConfigManager(() => helper.search());

    // We need to create a new helper that will contain both the user config
    // defined on helper and the default config.
    // This is important because we do not want to persist the default config
    // in the provided helper's state, which controls the URL sync. The provided
    // helper should only ever be changed from a user action.
    const masterHelper = algoliasearchHelper(
      helper.client,
      helper.getState().index
    );

    this.originalSearch = helper.search;

    helper.search = (...args) => {
      const state = this.configManager.getState(helper.getState());
      masterHelper.setState(state).search(...args);
      return helper;
    };

    masterHelper.on('change', (...args) => {
      helper.emit('change', ...args);
    });

    masterHelper.on('search', (...args) => {
      helper.emit('search', ...args);
    });

    masterHelper.on('result', (...args) => {
      helper.emit('result', ...args);
    });

    masterHelper.on('error', (...args) => {
      helper.emit('error', ...args);
    });
  }

  componentWillUnmount() {
    this.helper.search = this.originalSearch;
  }

  getChildContext() {
    return {
      algoliaConfigManager: this.configManager,
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
