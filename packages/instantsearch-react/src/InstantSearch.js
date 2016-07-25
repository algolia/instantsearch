import React, {PropTypes, Component} from 'react';
import algoliasearch from 'algoliasearch';
import algoliasearchHelper, {SearchParameters} from 'algoliasearch-helper';
import {Provider} from 'react-algoliasearch-helper';
import omit from 'lodash/object/omit';
import isEqual from 'lodash/lang/isEqual';
import {createHistory, createMemoryHistory} from 'history';

import createConfigManager from './createConfigManager';
import createStateManager from './createStateManager';
import {configManagerPropType, stateManagerPropType} from './propTypes';

class InstantSearch extends Component {
  static propTypes = {
    // @FIX: a few of these props are only applied on component initialization
    // and can't be updated afterwards. appId, apiKey, history, treshold...
    appId: PropTypes.string,
    apiKey: PropTypes.string,
    indexName: PropTypes.string,
    history: PropTypes.object,
    createURL: PropTypes.func,
    treshold: PropTypes.number,
    configureState: PropTypes.func,
    urlSync: PropTypes.bool,
  };

  static defaultProps = {
    treshold: 700,
    urlSync: true,
  };

  static childContextTypes = {
    algoliaConfigManager: configManagerPropType.isRequired,
    algoliaStateManager: stateManagerPropType.isRequired,
  };

  constructor(props) {
    super(props);

    const client = algoliasearch(props.appId, props.apiKey);
    const helper = this.helper = algoliasearchHelper(client, props.indexName);

    const history =
      props.history ||
      // Easiest way, but probably not the best. We could also add code to
      // createStateManager to support no history at all.
      props.urlSync ? createHistory() : createMemoryHistory();

    const getState = () => {
      // Retrieve the state from the state manager.
      // This state is the result of all user actions on the page, starting from
      // an empty state.
      let state = new SearchParameters({
        ...this.stateManager.getState(),
        index: props.indexName,
      });
      if (this.props.configureState) {
        // Apply the user configuration to the state. This is notably useful for
        // applying URL parameters that are not controlled by the state manager.
        state = this.props.configureState(state);
      }

      // Apply the components configurations to the state.
      state = this.configManager.getState(state);

      return state;
    };

    const search = this.search = force => {
      const state = getState();

      if (!force && isEqual(state, helper.getState())) {
        // Avoid updating the state and calling search if it hasn't changed.
        // Otherwise we end up in an infinite loop of
        // setState -> config update -> setState
        // There might be a better way to avoid this than deep equality check.
        // This is kinda sad: since our helper states are immutable, deep
        // equality check could be free.
        return;
      }

      helper.setState(state);
      helper.search();
    };

    this.configManager = createConfigManager(search);

    this.stateManager = createStateManager(history, search, {
      createURL: props.createURL,
      treshold: props.treshold,
    });

    // Apply the initial state from the history.
    // This setState won't trigger any updates anywhere. At this point we
    // haven't passed it to the Provider yet.
    helper.setState(getState());
  }

  componentDidMount() {
    // In the case where no components with a custom configure method were
    // rendered, we still need to perform a search in order to display initial
    // results.
    // Note that on initial render, this will be called before any configManager
    // onUpdate callback, as they are batched and scheduled for the next tick.
    this.search(true);
  }

  componentWillUnmount() {
    // `stateManager` listens to the history, which can outlast this component
    // in the case where it was passed in from props. This means we need to
    // remove all listeners we added to it before unmounting. Otherwise, we'll
    // still get search calls after the component has unmounted.
    // This is also necessary for this component to be garbage collected.
    this.stateManager.unlisten();
  }

  getChildContext() {
    return {
      algoliaConfigManager: this.configManager,
      algoliaStateManager: this.stateManager,
    };
  }

  render() {
    return (
      <Provider
        {...omit(this.props, Object.keys(InstantSearch.propTypes))}
        helper={this.helper}
      />
    );
  }
}

export default InstantSearch;
