import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { isSpecialClick } from '../core/utils';

export default class Link extends Component {
  static propTypes = {
    onClick: PropTypes.func.isRequired,
  };

  onClick = (e) => {
    if (isSpecialClick(e)) {
      return;
    }
    this.props.onClick();
    e.preventDefault();
  };

  render() {
    return <a {...this.props} onClick={this.onClick} />;
  }
}
