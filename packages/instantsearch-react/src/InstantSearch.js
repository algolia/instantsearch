import {PropTypes, Component, Children} from 'react';
import algoliasearch from 'algoliasearch';
import algoliasearchHelper, {SearchParameters} from 'algoliasearch-helper';
import {omit, isEqual, includes} from 'lodash';
import qs from 'qs';
import {createHistory} from 'history';

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

function alphabeticalSort(a, b) {
  if (a > b) {
    return 1;
  }
  if (a === b) {
    return 0;
  }
  return 1;
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
    search: query ? `?${qs.stringify(query, {sort: alphabeticalSort})}` : '',
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
    threshold: PropTypes.number,
    createURL: PropTypes.func,

    state: PropTypes.object,
    onStateChange: PropTypes.func,

    children: PropTypes.node,
  };

  static defaultProps = {
    urlSync: true,
    threshold: 700,
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
      this.history = props.history || props.urlSync && createHistory();

      if (this.history) {
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
    }

    this.widgetsManager = createWidgetsManager(
      this.onStateUpdate,
      this.onWidgetsUpdate,
      this.createHrefForState
    );

    let initialState;
    if (props.state) {
      initialState = props.state;
    } else if (this.history) {
      initialState = getStateFromLocation(this.currentLocation);
    } else {
      initialState = {};
    }

    this.store = createStore({
      widgets: initialState,
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

  // Called whenever a location is pushed/popped/replaced.
  onLocationChange = location => {
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

  // Called whenever a widget updates its state via its `refine` method.
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

    if (this.history) {
      // Since there's a two way binding between url and state, we need to
      // ignore some location and state updates.
      if (!this.skipNextStateUpdate) {
        // This must be after `onNewState`/`store.setState` since
        // `createHrefForState` depends on the new metadata.
        const href = this.createHrefForState(widgetsState);
        this.skipNextLocationUpdate = true;
        const newPush = Date.now();
        if (
          this.lastPush !== -1 &&
          newPush - this.lastPush <= this.props.threshold
        ) {
          this.history.replace(href);
        } else {
          this.history.push(href);
        }
        this.lastPush = newPush;
      } else {
        this.skipNextStateUpdate = false;
      }
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

  // Called whenever a widget has been rendered with new props.
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
    // @TODO: Provide a way to either configure base SearchParameters.
    const searchParameters = this.widgetsManager.getSearchParameters(
      baseSearchParameters
    );
    const promise = this.helper.searchOnce(searchParameters);

    promise.then(({content}) => {
      this.store.setState({
        ...this.store.getState(),
        results: content,
        searching: false,
      });
    }, error => {
      this.store.setState({
        ...this.store.getState(),
        error,
        searching: false,
      });
    }).catch(error => {
      // Since setState is synchronous, any error that occurs in the render of a
      // component will be swallowed by this promise.
      // This is a trick to make the error show up correctly in the console.
      // See http://stackoverflow.com/a/30741722/969302
      setTimeout(() => {
        throw error;
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
    if (this.history) {
      return this.history.createHref(
        applyStateToLocation(
          this.currentLocation,
          state,
          this.getWidgetsIds(this.store.getState().metadata)
        )
      );
    }
    return '#';
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
