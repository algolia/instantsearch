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
    ais: PropTypes.object.isRequired,
  };

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
        onInternalStateUpdate: this.onHistoryInternalStateUpdate,
        getIgnoredKeys: this.getIgnoredKeys,
      });
      initialState = this.hsManager.getStateFromCurrentLocation();
    } else {
      initialState = {};
    }

    this.aisManager = createInstantSearchManager({
      appId: props.appId,
      apiKey: props.apiKey,
      indexName: props.indexName,

      initialState,
      createHrefForState: this.createHrefForState,
      onInternalStateUpdate: this.onWidgetsInternalStateUpdate,
    });
  }

  componentWillReceiveProps(nextProps) {
    validateProps(nextProps);
    validateNextProps(this.props, nextProps);
    if (nextProps.state) {
      this.aisManager.onExternalStateUpdate(nextProps.state);
    }
  }

  componentWillUnmount() {
    if (this.history) {
      this.hsManager.unlisten();
    }
  }

  getChildContext() {
    return {
      ais: this.aisManager.context,
    };
  }

  createHrefForState = state => {
    if (this.props.createURL) {
      return this.props.createURL(state, this.aisManager.getWidgetsIds());
    } else if (this.isHSControlled) {
      return this.hsManager.createHrefForState(
        state, this.aisManager.getWidgetsIds()
      );
    } else {
      return '#';
    }
  };

  onHistoryInternalStateUpdate = state => {
    this.aisManager.onExternalStateUpdate(state);
  };

  onWidgetsInternalStateUpdate = state => {
    if (this.isControlled) {
      this.props.onStateChange(state);
    } else if (this.isHSControlled) {
      this.aisManager.onExternalStateUpdate(state);
      // This needs to go after the aisManager's update, since it depends on new
      // metadata.
      this.hsManager.onExternalStateUpdate(state);
    }
  };

  getIgnoredKeys = () => this.aisManager.getWidgetsIds();

  render() {
    return Children.only(this.props.children);
  }
}

export default InstantSearch;
