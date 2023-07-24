import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { PanelConsumer } from './Panel';

class PanelCallbackHandler extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    canRefine: PropTypes.bool.isRequired,
    setCanRefine: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.props.setCanRefine(this.props.canRefine);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.canRefine !== this.props.canRefine) {
      this.props.setCanRefine(this.props.canRefine);
    }
  }

  render() {
    return this.props.children;
  }
}

const PanelWrapper = ({ canRefine, children }) => (
  <PanelConsumer>
    {(setCanRefine) => (
      <PanelCallbackHandler setCanRefine={setCanRefine} canRefine={canRefine}>
        {children}
      </PanelCallbackHandler>
    )}
  </PanelConsumer>
);

PanelWrapper.propTypes = {
  canRefine: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
};

export default PanelWrapper;
