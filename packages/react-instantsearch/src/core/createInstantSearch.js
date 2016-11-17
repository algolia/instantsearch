import React, {Component, PropTypes} from 'react';
import InstantSearch from './InstantSearch';

export default function createInstantSearch(defaultAlgoliaClient) {
  return class CreateInstantSearch extends Component {
    static propTypes = {
      algoliaClient: PropTypes.object,
      appId: PropTypes.string,
      apiKey: PropTypes.string,
    };

    render() {
      const client = this.props.algoliaClient || defaultAlgoliaClient(this.props.appId, this.props.apiKey);
      return (
        <InstantSearch
          {...this.props}
          algoliaClient={client}
        />
      );
    }
  };
}
