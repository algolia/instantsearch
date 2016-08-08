import {PropTypes, Component, Children} from 'react';
import algoliasearch from 'algoliasearch';
import algoliasearchHelper, {SearchParameters} from 'algoliasearch-helper';
import {omit, isEqual, includes} from 'lodash';
import qs from 'qs';
import {createHistory, createMemoryHistory} from 'history';

import createWidgetsManager from './createWidgetsManager';
import createStore from './createStore';

function getStateFromLocation(location) {
  if (location.query) {
    return location.query;
  }
  // We could also use location.query with the useQueries enhancer, but that
  // would require a bit more configuration from the user.
  return qs.parse(location.search.slice(1));
}

function applyStateToLocation(location, state, knownKeys) {
  const urlState = getStateFromLocation(location);
  const unknownParameters = omit(urlState, knownKeys);
  const query = {
    ...unknownParameters,
    ...state,
  };
  if (location.query) {
    return {
      ...location,
      query,
    };
  }
  return {
    ...location,
    search: query ? `?${qs.stringify(query)}` : '',
  };
}

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
    const plural = missingProps.length > 1;
    const missingPropsStr = formatProps(missingProps);
    const presentPropsStr = formatProps(presentProps);
    const propName = `prop${plural ? 's' : ''}`;
    throw new Error(
      `You must provide ${plural ? '' : 'a '} ${missingPropsStr} ${propName} ` +
      `alongside the ${presentPropsStr} ${propName} on <InstantSearch>`
    );
  }
}

function validateNextProps(props, nextProps) {
  if (!props.onStateChange && nextProps.onStateChange) {
    throw new Error(
      'You can\'t switch <InstantSearch> from being controlled to uncontrolled'
    );
  }
}

class InstantSearch extends Component {
  static propTypes = {
    // @TODO: These props are currently constant.
    appId: PropTypes.string.isRequired,
    apiKey: PropTypes.string.isRequired,
    indexName: PropTypes.string.isRequired,

    history: PropTypes.object,
    urlSync: PropTypes.bool,
    treshold: PropTypes.number,
    createURL: PropTypes.func,

    state: PropTypes.object,
    onStateChange: PropTypes.func,

    children: PropTypes.node,
  };

  static defaultProps = {
    urlSync: true,
    treshold: 700,
  };

  static childContextTypes = {
    // @TODO: more precise widgets manager propType
    aisStore: PropTypes.object.isRequired,
    aisWidgetsManager: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    const client = algoliasearch(props.appId, props.apiKey);
    this.helper = algoliasearchHelper(client);

    validateProps(props);

    if (!props.onStateChange) {
      this.history =
        props.history ||
        (props.urlSync ? createHistory() : createMemoryHistory());

      this.currentLocation = null;
      // In history V2, .listen is called with the initial location.
      // In V3, you need to use .getCurrentLocation()
      if (this.history.getCurrentLocation) {
        this.currentLocation = this.history.getCurrentLocation();
      }

      this.lastPush = -1;
      this.skipNextLocationUpdate = false;
      this.skipNextStateUpdate = false;
      this.unlisten = this.history.listen(this.onLocationChange);
    }

    this.widgetsManager = createWidgetsManager(
      this.onStateUpdate,
      this.onWidgetsUpdate,
      this.createHrefForState
    );

    this.store = createStore({
      widgets: props.state ?
        props.state :
        getStateFromLocation(this.currentLocation),
      metadata: [],
      results: null,
      error: null,
      searching: false,
    });
  }

  componentWillReceiveProps(nextProps) {
    validateProps(nextProps);
    validateNextProps(this.props, nextProps);
    if (nextProps.state) {
      this.onNewState(nextProps.state);
    }
  }

  componentWillUnmount() {
    if (this.history) {
      this.unlisten();
    }
  }

  onLocationChange = location => {
    if (this.onStateChange) {
      // The component's state is controlled. Ignore location update.
      return;
    }

    if (this.currentLocation === null && !this.history.getCurrentLocation) {
      // Initial location. Called synchronously by listen.
      this.currentLocation = location;
      return;
    }
    this.currentLocation = location;
    if (this.skipNextLocationUpdate) {
      this.skipNextLocationUpdate = false;
      return;
    }
    const state = getStateFromLocation(this.currentLocation);
    this.skipNextStateUpdate = true;
    this.widgetsManager.setState(state);
  };

  onStateUpdate = widgetsState => {
    widgetsState = this.transitionState(
      this.store.getState().widgets,
      widgetsState
    );

    if (this.props.onStateChange) {
      // The component is controlled.
      this.props.onStateChange(widgetsState);
      return;
    }

    this.onNewState(widgetsState);

    if (!this.skipNextStateUpdate) {
      // This must be after `onNewState`/`store.setState` since
      // `createHrefForState` depends on the new metadata.
      const href = this.createHrefForState(widgetsState);
      this.skipNextLocationUpdate = true;
      const newPush = Date.now();
      if (
        this.lastPush !== -1 &&
        newPush - this.lastPush <= this.props.treshold
      ) {
        this.history.replace(href);
      } else {
        this.history.push(href);
      }
      this.lastPush = newPush;
    } else {
      this.skipNextStateUpdate = false;
    }
  };

  onNewState = newState => {
    const metadata = this.widgetsManager.getMetadata(newState);

    this.store.setState({
      ...this.store.getState(),
      widgets: newState,
      metadata,
      searching: true,
    });

    this.search();
  };

  onWidgetsUpdate = () => {
    const widgetsState = this.store.getState().widgets;
    const metadata = this.widgetsManager.getMetadata(widgetsState);

    this.store.setState({
      ...this.store.getState(),
      metadata,
      searching: true,
    });

    this.search();
  };

  search = () => {
    const baseSearchParameters = new SearchParameters({
      index: this.props.indexName,
    });
    const searchParameters = this.widgetsManager.getSearchParameters(
      baseSearchParameters
    );
    this.helper.searchOnce(searchParameters)
      .then(({content}) => {
        this.store.setState({
          ...this.store.getState(),
          results: content,
          searching: false,
        });
      })
      .catch(error => {
        this.store.setState({
          ...this.store.getState(),
          error,
          searching: false,
        });
      });
  };

  createHrefForState = state => {
    state = this.transitionState(
      this.store.getState().widgets,
      state
    );
    if (this.props.createURL) {
      return this.props.createURL(state);
    }
    return this.history.createHref(
      applyStateToLocation(
        this.currentLocation,
        state,
        this.getWidgetsIds(this.store.getState().metadata)
      )
    );
  };

  getWidgetsIds = metadata => metadata.reduce((res, meta) =>
    typeof meta.id !== 'undefined' ? res.concat(meta.id) : res
  , []);

  transitionState = (state, nextState) => {
    const clearIds = this.store.getState().metadata.reduce((res, meta) =>
      meta.clearOnChange ? res.concat(meta.id) : res
    , []);
    const changedKeys = Object.keys(nextState).filter(key =>
      !isEqual(state[key], nextState[key])
    );
    nextState = clearIds.reduce((res, clearId) =>
      changedKeys.length > 0 && !includes(changedKeys, clearId) ?
        omit(res, clearId) :
        res
    , nextState);
    return nextState;
  };

  getChildContext() {
    return {
      aisStore: this.store,
      aisWidgetsManager: this.widgetsManager,
    };
  }

  render() {
    return Children.only(this.props.children);
  }
}

export default InstantSearch;
