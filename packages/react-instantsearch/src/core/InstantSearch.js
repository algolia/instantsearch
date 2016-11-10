import {PropTypes, Component, Children} from 'react';
import {createHistory} from 'history';

import createHistoryStateManager from './createHistoryStateManager';
import createInstantSearchManager from './createInstantSearchManager';

function formatProps(props) {
  return props.map(prop => `\`${prop}\``).join(', ');
}

const neededProps = ['state', 'onStateChange', 'createURL'];
function validateProps(props) {
  const presentProps = [];
  const missingProps = [];
  for (const prop of neededProps) {
    if (props[prop]) {
      presentProps.push(prop);
    } else {
      missingProps.push(prop);
    }
  }
  if (presentProps.length !== 0 && missingProps.length !== 0) {
    const missingPlural = missingProps.length > 1;
    const presentPlural = presentProps.length > 1;
    const missingPropsStr = formatProps(missingProps);
    const presentPropsStr = formatProps(presentProps);
    const missingPropName = `prop${missingPlural ? 's' : ''}`;
    const presentPropName = `prop${presentPlural ? 's' : ''}`;
    throw new Error(
      `You must provide ${missingPlural ? '' : 'a '}${missingPropsStr} ` +
      `${missingPropName} alongside the ${presentPropsStr} ` +
      `${presentPropName} on <InstantSearch>`
    );
  }
}

function validateNextProps(props, nextProps) {
  if (!props.onStateChange && nextProps.onStateChange) {
    throw new Error(
      'You can\'t switch <InstantSearch> from being uncontrolled to controlled'
    );
  } else if (props.onStateChange && !nextProps.onStateChange) {
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

    validateProps(props);

    this.isControlled = Boolean(props.onStateChange);
    this.isHSControlled = !this.isControlled &&
                          (props.history || props.urlSync);

    let initialState;
    if (this.isControlled) {
      initialState = props.state;
    } else if (this.isHSControlled) {
      const hs = props.history || createHistory();
      this.hsManager = createHistoryStateManager({
        history: hs,
        threshold: props.threshold,
        onInternalStateUpdate: this.onHistoryInternalStateUpdate.bind(this),
        getKnownKeys: this.getKnownKeys.bind(this),
      });
      // @TODO: Since widgets haven't been registered yet, we have no way of
      // knowing which URL query keys are known and which aren't. As such,
      // `getStateFromCurrentLocation()` simply returns the current URL query
      // deserialized.
      // We might want to initialize to an empty state here and call
      // `onHistoryInternalStateUpdate` on `componentDidMount`, once all widgets
      // have been registered.
      initialState = this.hsManager.getStateFromCurrentLocation();
    } else {
      initialState = {};
    }

    this.aisManager = createInstantSearchManager({
      appId: props.appId,
      apiKey: props.apiKey,
      indexName: props.indexName,
      searchParameters: props.searchParameters,
      algoliaClient: props.algoliaClient,

      initialState,
    });
  }

  componentWillReceiveProps(nextProps) {
    validateProps(nextProps);
    validateNextProps(this.props, nextProps);
    if (this.isControlled) {
      this.aisManager.onExternalStateUpdate(nextProps.state);
    }
  }

  componentWillUnmount() {
    if (this.isHSControlled) {
      this.hsManager.unlisten();
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

    if (this.isControlled) {
      return this.props.createURL(state, this.getKnownKeys());
    } else if (this.isHSControlled) {
      return this.hsManager.createHrefForState(state, this.getKnownKeys());
    } else {
      return '#';
    }
  }

  onHistoryInternalStateUpdate(state) {
    this.aisManager.onExternalStateUpdate(state);
  }

  onWidgetsInternalStateUpdate(state) {
    state = this.aisManager.transitionState(state);

    if (this.isControlled) {
      this.props.onStateChange(state);
    } else {
      this.aisManager.onExternalStateUpdate(state);
      if (this.isHSControlled) {
        // This needs to go after the aisManager's update, since it depends on new
        // metadata.
        this.hsManager.onExternalStateUpdate(state);
      }
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
  appId: PropTypes.string,
  apiKey: PropTypes.string,
  indexName: PropTypes.string.isRequired,

  algoliaClient: PropTypes.object,

  searchParameters: PropTypes.object,

  history: PropTypes.object,
  urlSync: PropTypes.bool,
  threshold: PropTypes.number,
  createURL: PropTypes.func,

  state: PropTypes.object,
  onStateChange: PropTypes.func,

  children: PropTypes.node,
};

InstantSearch.defaultProps = {
  urlSync: false,
  threshold: 700,
};

InstantSearch.childContextTypes = {
  // @TODO: more precise widgets manager propType
  ais: PropTypes.object.isRequired,
};

export default InstantSearch;
