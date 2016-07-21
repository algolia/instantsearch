import React, {PropTypes, Component} from 'react';

import {itemPropType} from '../propTypes';

export default class RefinementListCheckboxItem extends Component {
  static propTypes = {
    item: itemPropType.isRequired,
    selected: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  onChange = e => {
    this.props.onChange(this.props.item, e.target.checked);
  };

  render() {
    const {item, selected} = this.props;
    return (
      <label>
        <input type="checkbox" checked={selected} onChange={this.onChange} />
        {item.value} {item.count}
      </label>
    );
  }
}
