import PropTypes from 'prop-types';
import React, { Component } from 'react';

export default function(ComposedComponent) {
  return class AutoHide extends Component {
    static displayName = `${ComposedComponent.name}-AutoHide`;
    static propTypes = { shouldAutoHideContainer: PropTypes.bool.isRequired };

    render() {
      const { shouldAutoHideContainer } = this.props;
      return (
        <div style={{ display: shouldAutoHideContainer ? 'none' : '' }}>
          <ComposedComponent {...this.props} />
        </div>
      );
    }
  };
}
