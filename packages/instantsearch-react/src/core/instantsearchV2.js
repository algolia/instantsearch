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
      widget.render({
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

function createWidget(Widget) {
  return opts => ({
    render(context) {
      const container = typeof opts.container === 'string' ?
        document.querySelector(opts.container) : opts.container;
      ReactDOM.render(
        <AISContextProvider context={context}>
          <Widget {...omit(opts, 'container')} />
        </AISContextProvider>,
        container
      );
    },
  });
}

instantsearch.widgets = {
  searchBox: createWidget(SearchBox),
  hits: createWidget(Hits),
  pagination: createWidget(Pagination),
};

export default instantsearch;
