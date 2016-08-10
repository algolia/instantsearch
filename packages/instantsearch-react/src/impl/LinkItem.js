import React, {PropTypes, Component} from 'react';
import omit from 'lodash/object/omit';

import {isSpecialClick} from '../utils';

export default class LinkItem extends Component {
  static propTypes = {
    onClick: PropTypes.func.isRequired,
  };

  onClick = e => {
    if (isSpecialClick(e)) {
      return;
    }
    this.props.onClick();
    e.preventDefault();
  };

  render() {
    return (
      <a
        {...omit(this.props, 'onClick', 'item')}
        onClick={this.onClick}
      />
    );
  }
}
