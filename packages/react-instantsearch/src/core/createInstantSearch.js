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

    constructor(props) {
      super();
      this.client = props.algoliaClient || defaultAlgoliaClient(props.appId, props.apiKey);
    }

    componentWillReceiveProps(nextProps) {
      const props = this.props;
      if (nextProps.algoliaClient) {
        this.client = nextProps.algoliaClient;
      } else if (props.appId !== nextProps.appId || props.apiKey !== nextProps.apiKey) {
        this.client = defaultAlgoliaClient(nextProps.appId, nextProps.apiKey);
      }
    }

    render() {
      return (
        <InstantSearch
          {...this.props}
          root={root}
          algoliaClient={this.client}
        />
      );
    }
  };
}
