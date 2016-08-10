import React, {PropTypes, Component} from 'react';

import themeable from '../themeable';

import Select from './Select';

class SortBy extends Component {
  static propTypes = {
    applyTheme: PropTypes.func.isRequired,
    refine: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      index: PropTypes.string.isRequired,
    })).isRequired,
    selectedIndex: PropTypes.string.isRequired,
  };

  onChange = e => {
    this.props.refine(e.target.value);
  }

  render() {
    const {applyTheme, refine, items, selectedIndex} = this.props;

    return (
      <Select
        {...applyTheme('root', 'root')}
        selectedItem={selectedIndex}
        onChange={refine}
        items={items.map(item => ({
          label: item.label,
          value: item.index,
        }))}
      />
    );
  }
}

export default themeable({
  root: 'SortBy',
})(SortBy);
