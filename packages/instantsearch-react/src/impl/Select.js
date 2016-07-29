import React, {PropTypes, Component} from 'react';

import {itemsPropType, selectedItemsPropType} from '../propTypes';
import {getTranslation} from '../utils';

const defaultTranslations = {
  none: 'None',
  count: count => count.toString(),
};

class Select extends Component {
  static propTypes = {
    translations: PropTypes.object,
    refine: PropTypes.func.isRequired,
    items: itemsPropType,
    selectedItems: selectedItemsPropType,
  };

  static defaultProps = {
    translations: defaultTranslations,
  };

  onChange = e => {
    if (e.target.value === '') {
      this.props.refine(this.props.selectedItems[0]);
    } else {
      this.props.refine(e.target.value);
    }
  }

  render() {
    const {items, selectedItems, translations} = this.props;
    if (!items) {
      return null;
    }

    const selectedItem = selectedItems[0];

    return (
      <select value={selectedItem || ''} onChange={this.onChange}>
        <option value="">
          {getTranslation(
            'none',
            defaultTranslations,
            translations
          )}
        </option>
        {items.map(item =>
          <option key={item.value} value={item.value}>
            {item.value}
            {' '}
            {getTranslation(
              'count',
              defaultTranslations,
              translations,
              item.count
            )}
          </option>
        )}
      </select>
    );
  }
}

export default Select;
