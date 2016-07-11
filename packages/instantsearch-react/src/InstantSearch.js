import React, {PropTypes, Component} from 'react';
import algoliasearch from 'algoliasearch';
import algoliasearchHelper from 'algoliasearch-helper';
import Provider from 'algoliasearch-helper-provider/src/Provider';
import omit from 'lodash/object/omit';

import createConfigManager from './createConfigManager';
import configManagerShape from './configManagerShape';

class InstantSearch extends Component {
  static propTypes = {
    appId: PropTypes.string,
    apiKey: PropTypes.string,
    indexName: PropTypes.string,
    client: PropTypes.object,
    helper: PropTypes.instanceOf(algoliasearchHelper.AlgoliaSearchHelper),
  };

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
    return (
      <Provider
        {...omit(this.props, Object.keys(InstantSearch.propTypes))}
        helper={this.helper}
      />
    );
  }
}

export default InstantSearch;
