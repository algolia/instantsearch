import React, {PropTypes, Component} from 'react';

import {itemPropType} from '../propTypes';

export default class MenuLink extends Component {
  static propTypes = {
    item: itemPropType.isRequired,
    selected: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
  };

  onClick = () => {
    this.props.onClick(this.props.item);
  };

  render() {
    const {item, selected} = this.props;
    return (
      <a
        href="#"
        onClick={this.onClick}
        style={{
          fontWeight: selected ? 'bold' : null,
        }}
      >
        {item.value} {item.count}
      </a>
    );
  }
}
