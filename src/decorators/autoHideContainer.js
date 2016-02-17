// Issue with eslint + high-order components like decorators
/* eslint react/prop-types: 0 */

import React from 'react';
import ReactDOM from 'react-dom';

function autoHideContainer(ComposedComponent) {
  class AutoHide extends React.Component {
    componentDidMount() {
      this._hideOrShowContainer(this.props);
    }

    componentWillReceiveProps(nextProps) {
      if (this.props.shouldAutoHideContainer === nextProps.shouldAutoHideContainer) {
        return;
      }

      this._hideOrShowContainer(nextProps);
    }

    shouldComponentUpdate(nextProps) {
      return nextProps.shouldAutoHideContainer === false;
    }

    _hideOrShowContainer(props) {
      let container = ReactDOM.findDOMNode(this).parentNode;
      container.style.display = (props.shouldAutoHideContainer === true) ? 'none' : '';
    }

    render() {
      return <ComposedComponent {...this.props} />;
    }
  }

  AutoHide.propTypes = {
    shouldAutoHideContainer: React.PropTypes.bool.isRequired
  };

  // precise displayName for ease of debugging (react dev tool, react warnings)
  AutoHide.displayName = ComposedComponent.name + '-AutoHide';

  return AutoHide;
}

export default autoHideContainer;
