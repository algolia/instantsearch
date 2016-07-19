import React, {PropTypes, Component} from 'react';

import {itemPropType} from '../propTypes';

export default class RefinementListCheckboxItem extends Component {
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
      <div onClick={this.onClick}>
        <input type="checkbox" checked={selected} />
        {item.value} {item.count}
      </div>
    );
  }
}
