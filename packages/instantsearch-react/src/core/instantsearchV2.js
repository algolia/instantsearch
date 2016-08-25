import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {createHistory} from 'history';
import {omit} from 'lodash';

import createHistoryStateManager from './createHistoryStateManager';
import createInstantSearchManager from './createInstantSearchManager';

import SearchBox from '../widgets/SearchBox';
import Hits from '../widgets/Hits';
import Pagination from '../widgets/Pagination';

function instantsearch(opts) {
  const {
    appId,
    apiKey,
    indexName,

    urlSync,
    threshold = 700,
  } = opts;

  let initialState;
  let hsm;
  if (urlSync) {
    hsm = createHistoryStateManager({
      history: createHistory(),
      threshold,
      onInternalStateUpdate: onHistoryInternalStateUpdate,
      getKnownKeys,
    });
    initialState = hsm.getStateFromCurrentLocation();
  } else {
    initialState = {};
  }

  const ism = createInstantSearchManager({
    appId,
    apiKey,
    indexName,

    initialState,
  });

  function getKnownKeys() {
    return ism.getWidgetsIds();
  }

  function onHistoryInternalStateUpdate(state) {
    ism.onExternalStateUpdate(state);
  }

  function onWidgetsInternalStateUpdate(state) {
    state = ism.transitionState(state);
    ism.onExternalStateUpdate(state);
    if (urlSync) {
      hsm.onExternalStateUpdate(state);
    }
  }

  function createHrefForState(state) {
    if (urlSync) {
      return hsm.createHrefForState(state);
    }
    return '#';
  }

  return {
    addWidget: widget => {
      widget({
        store: ism.store,
        widgetsManager: ism.widgetsManager,
        createHrefForState,
        onInternalStateUpdate: onWidgetsInternalStateUpdate,
      });
    },
  };
}

class AISContextProvider extends Component {
  static propTypes = {
    context: PropTypes.object.isRequired,
    children: PropTypes.node,
  };

  static childContextTypes = {
    ais: PropTypes.object.isRequired,
  };

  getChildContext() {
    return {
      ais: this.props.context,
    };
  }

  render() {
    return React.Children.only(this.props.children);
  }
}

function wrapReactWidget(Widget) {
  return opts => context => {
    const container = typeof opts.container === 'string' ?
      document.querySelector(opts.container) : opts.container;
    ReactDOM.render(
      <AISContextProvider context={context}>
        <Widget {...omit(opts, 'container')} />
      </AISContextProvider>,
      container
    );
  };
}

function customSearchBox(opts) {
  return context => {
    const id = 'q';
    const container = typeof opts.container === 'string' ?
      document.querySelector(opts.container) : opts.container;

    function getQuery() {
      return context.store.getState().widgets[id] || '';
    }

    context.widgetsManager.registerWidget({
      // Declare which state key we're going to use, so that the history manager
      // knows which keys are known and which aren't.
      getMetadata: () => ({id}),
      // Every time the state changes, or a widget updates, we will re-run this
      // method on the search parameters and search.
      getSearchParameters: sp => sp.setQuery(getQuery()),
    });

    const input = document.createElement('input');
    container.appendChild(input);

    let ignore = false;
    // Subscribe to store updates, so that updating the query from somewhere
    // else than this widget also updates this widget.
    context.store.subscribe(() => {
      if (getQuery() !== input.value) {
        ignore = true;
        input.value = getQuery();
      }
    });

    input.addEventListener('input', e => {
      if (ignore) {
        ignore = false;
        return;
      }
      // Trigger a state update.
      context.onInternalStateUpdate({
        [id]: e.target.value,
      });
    });
  };
}

instantsearch.widgets = {
  searchBox: wrapReactWidget(SearchBox),
  hits: wrapReactWidget(Hits),
  pagination: wrapReactWidget(Pagination),

  customSearchBox,
};

export default instantsearch;
