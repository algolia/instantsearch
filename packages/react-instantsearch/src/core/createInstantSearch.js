import React, {Component, PropTypes} from 'react';
import InstantSearch from './InstantSearch';
import pkg from '../../package.json';

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
      children: React.PropTypes.oneOfType([
        React.PropTypes.arrayOf(React.PropTypes.node),
        React.PropTypes.node,
      ]),
      indexName: PropTypes.string.isRequired,
    };

    constructor(props) {
      super();
      this.client = props.algoliaClient || defaultAlgoliaClient(props.appId, props.apiKey);
      this.client.addAlgoliaAgent(`react-instantsearch ${pkg.version}`);
    }

    componentWillReceiveProps(nextProps) {
      const props = this.props;
      if (nextProps.algoliaClient) {
        this.client = nextProps.algoliaClient;
      } else if (props.appId !== nextProps.appId || props.apiKey !== nextProps.apiKey) {
        this.client = defaultAlgoliaClient(nextProps.appId, nextProps.apiKey);
      }
      this.client.addAlgoliaAgent(`react-instantsearch ${pkg.version}`);
    }

    render() {
      return (
        <InstantSearch
          indexName={this.props.indexName}
          root={root}
          algoliaClient={this.client}
          children={this.props.children}
        />
      );
    }
  };
}
