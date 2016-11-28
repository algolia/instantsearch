import {PropTypes, Component, Children} from 'react';
import createInstantSearchManager from './createInstantSearchManager';

function validateNextProps(props, nextProps) {
  if (!props.state && nextProps.state) {
    throw new Error(
      'You can\'t switch <InstantSearch> from being uncontrolled to controlled'
    );
  } else if (props.state && !nextProps.state) {
    throw new Error(
      'You can\'t switch <InstantSearch> from being controlled to uncontrolled'
    );
  }
}

/* eslint valid-jsdoc: 0 */
/**
 * @description
 * InstantSearch is the root component of all react-instantsearch implementation.
 * It provides to all the connected components (aka widgets) a mean to interact
 * with the search state.
 * @kind component
 * @category core
 * @propType {string} appId - The Algolia application id.
 * @propType {string} apiKey - Your Algolia Search-Only API key.
 * @propType {string} indexName - The index in which to search.
 * @propType {object} [searchParameters] - Object containing query parameters to be sent to Algolia. It will be overriden by the search parameters resolved via the widgets. Typical use case: setting the distinct setting is done by providing an object like: `{distinct: 1}`. For more information about the kind of object that can be provided on the [official API documentation](https://www.algolia.com/doc/rest-api/search#full-text-search-parameters). See [Configuring Algolia search parameters](/guides/advanced-topics.html#how-to-configure-algolia-search-parameters).
 * @propType {func} onStateChange - See [URL Routing](/guides/advanced-topics.html#url-routing).
 * @propType {object} state - See [URL Routing](/guides/advanced-topics.html#url-routing).
 * @propType {func} createURL - See [URL Routing](/guides/advanced-topics.html#url-routing).
 * @example
 * import {InstantSearch, SearchBox, Hits} from 'react-instantsearch/dom';
 *
 * export default function Search() {
 *   return (
 *     <InstantSearch
 *       appId="appId"
 *       apiKey="apiKey"
 *       indexName="indexName"
 *     >
 *       <div>
 *         <SearchBox />
 *         <Hits />
 *       </div>
 *     </InstantSearch>
 *   );
 * }
 */
class InstantSearch extends Component {
  constructor(props) {
    super(props);

    this.isControlled = Boolean(props.state);

    const initialState = this.isControlled ? props.state : {};

    this.aisManager = createInstantSearchManager({
      indexName: props.indexName,
      searchParameters: props.searchParameters,
      algoliaClient: props.algoliaClient,
      initialState,
    });
  }

  componentWillReceiveProps(nextProps) {
    validateNextProps(this.props, nextProps);
    if (this.isControlled) {
      this.aisManager.onExternalStateUpdate(nextProps.state);
    }
  }

  getChildContext() {
    // If not already cached, cache the bound methods so that we can forward them as part
    // of the context.
    if (!this._aisContextCache) {
      this._aisContextCache = {
        ais: {
          onInternalStateUpdate: this.onWidgetsInternalStateUpdate.bind(this),
          createHrefForState: this.createHrefForState.bind(this),
        },
      };
    }

    return {
      ais: {
        ...this._aisContextCache.ais,
        store: this.aisManager.store,
        widgetsManager: this.aisManager.widgetsManager,
      },
    };
  }

  createHrefForState(state) {
    state = this.aisManager.transitionState(state);
    return this.isControlled && this.props.createURL ? this.props.createURL(state, this.getKnownKeys()) : '#';
  }

  onWidgetsInternalStateUpdate(state) {
    state = this.aisManager.transitionState(state);

    if (this.props.onStateChange) {
      this.props.onStateChange(state);
    }

    if (!this.isControlled) {
      this.aisManager.onExternalStateUpdate(state);
    }
  }

  getKnownKeys() {
    return this.aisManager.getWidgetsIds();
  }

  render() {
    const childrenCount = Children.count(this.props.children);
    if (childrenCount === 0)
      return null;
    else
      return Children.only(this.props.children);
  }
}

InstantSearch.propTypes = {
  // @TODO: These props are currently constant.
  indexName: PropTypes.string.isRequired,

  algoliaClient: PropTypes.object.isRequired,

  searchParameters: PropTypes.object,

  createURL: PropTypes.func,

  state: PropTypes.object,
  onStateChange: PropTypes.func,

  children: PropTypes.node,
};

InstantSearch.childContextTypes = {
  // @TODO: more precise widgets manager propType
  ais: PropTypes.object.isRequired,
};

export default InstantSearch;
