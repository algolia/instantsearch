import React, {PropTypes, Component} from 'react';

import themeable from '../../core/themeable';

import Select from '../../components/Select';

import theme from './SortBy.css';

class SortBy extends Component {
  static propTypes = {
    applyTheme: PropTypes.func.isRequired,
    refine: PropTypes.func.isRequired,

    /**
     * The different options, with the corresponding index.
     * @public
     * @defines SortByItem
     */
    items: PropTypes.arrayOf(PropTypes.shape({
      /**
       * Label to display on the option.
       */
      label: PropTypes.string.isRequired,
      /**
       * Index to use
       */
      value: PropTypes.string.isRequired,
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
        applyTheme={applyTheme}
        selectedItem={selectedIndex}
        onSelect={refine}
        items={items}
      />
    );
  }
}

export default themeable(theme)(SortBy);
