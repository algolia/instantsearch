import React, {PropTypes, Component, Children} from 'react';
import createInstantSearchManager from './createInstantSearchManager';

function validateNextProps(props, nextProps) {
  if (!props.searchState && nextProps.searchState) {
    throw new Error(
      'You can\'t switch <InstantSearch> from being uncontrolled to controlled'
    );
  } else if (props.searchState && !nextProps.searchState) {
    throw new Error(
      'You can\'t switch <InstantSearch> from being controlled to uncontrolled'
    );
  }
}

/* eslint valid-jsdoc: 0 */
/**
 * @description
 * `<InstantSearch>` is the root component of all React InstantSearch implementations.
 * It provides all the connected components (aka widgets) a means to interact
 * with the searchState.
 * @kind widget
 * @propType {string} appId - The Algolia application id.
 * @propType {string} apiKey - Your Algolia Search-Only API key.
 * @propType {string} indexName - The index in which to search.
 * @propType {object} [searchParameters] - Object containing query parameters to be sent to Algolia.
 * It will be overriden by the search parameters resolved via the widgets.
 *
 * Typical use case: setting the distinct setting is done by providing an object like: `{distinct: 1}`.
 * For more information about the kind of object that can be provided on the
 * [official API documentation](https://www.algolia.com/doc/rest-api/search#full-text-search-parameters).
 *
 * Read the [search parameters guide](guide/Search_parameters.html).
 * @propType {func} onSearchStateChange - See [URL Routing](guide/Routing.html).
 * @propType {object} searchState - See [URL Routing](guide/Routing.html).
 * @propType {func} createURL - See [URL Routing](guide/Routing.html).
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
 *       <SearchBox />
 *       <Hits />
 *     </InstantSearch>
 *   );
 * }
 */
class InstantSearch extends Component {
  constructor(props) {
    super(props);

    this.isControlled = Boolean(props.searchState);

    const initialState = this.isControlled ? props.searchState : {};

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
      this.aisManager.onExternalStateUpdate(nextProps.searchState);
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

  createHrefForState(searchState) {
    searchState = this.aisManager.transitionState(searchState);
    return this.isControlled && this.props.createURL ? this.props.createURL(searchState, this.getKnownKeys()) : '#';
  }

  onWidgetsInternalStateUpdate(searchState) {
    searchState = this.aisManager.transitionState(searchState);

    if (this.props.onSearchStateChange) {
      this.props.onSearchStateChange(searchState);
    }

    if (!this.isControlled) {
      this.aisManager.onExternalStateUpdate(searchState);
    }
  }

  getKnownKeys() {
    return this.aisManager.getWidgetsIds();
  }

  render() {
    const childrenCount = Children.count(this.props.children);
    const {Root, props} = this.props.root;
    if (childrenCount === 0)
      return null;
    else
      return <Root {...props}>{this.props.children}</Root>;
  }
}

InstantSearch.propTypes = {
  // @TODO: These props are currently constant.
  indexName: PropTypes.string.isRequired,

  algoliaClient: PropTypes.object.isRequired,

  searchParameters: PropTypes.object,

  createURL: PropTypes.func,

  searchState: PropTypes.object,
  onSearchStateChange: PropTypes.func,

  children: PropTypes.node,

  root: PropTypes.shape({
    Root: PropTypes.string.isRequired,
    props: PropTypes.object,
  }).isRequired,
};

InstantSearch.childContextTypes = {
  // @TODO: more precise widgets manager propType
  ais: PropTypes.object.isRequired,
};

export default InstantSearch;
