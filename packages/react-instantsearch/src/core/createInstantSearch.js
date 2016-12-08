import React, {Component, PropTypes} from 'react';
import InstantSearch from './InstantSearch';

/**
 * Creates a specialized root InstantSearch component. It accepts
 * an algolia client and a specification of the root Element.
 * @param {function} defaultAlgoliaClient - a function that builds an Algolia client
 * @param {object} root - the defininition of the root of an InstantSearch sub tree.
 * @returns {object} an InstantSearch root
 */
export default function createInstantSearch(defaultAlgoliaClient, root) {
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
          root={root}
          algoliaClient={client}
        />
      );
    }
  };
}
