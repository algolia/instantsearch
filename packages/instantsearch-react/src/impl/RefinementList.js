import React, {PropTypes, Component} from 'react';

import {itemsPropType, selectedItemsPropType} from '../propTypes';
import themeable from 'react-themeable';

import RefinementListCheckboxItem from './RefinementListCheckboxItem';

const defaultTranslations = {
  count: count => count.toString(),
};

const defaultTheme = {
  root: 'RefinementListLinks',
  list: 'RefinementListLinks__list',
  item: 'RefinementListLinks__item',
  itemSelected: 'RefinementListLinks__item--selected',
  itemLink: 'RefinementListLinks__item__link',
  itemValue: 'RefinementListLinks__item__value',
  itemCount: 'RefinementListLinks__item__count',
};

class RefinementListLinks extends Component {
  static propTypes = {
    theme: PropTypes.object,
    translations: PropTypes.object,
    refine: PropTypes.func.isRequired,
    createURL: PropTypes.func.isRequired,
    items: itemsPropType,
    selectedItems: selectedItemsPropType,
  };

  static defaultProps = {
    theme: defaultTheme,
    translations: defaultTranslations,
  };

  onItemChange = (item, selected) => {
    const {selectedItems} = this.props;
    const nextSelectedItems = selectedItems.slice();
    const idx = nextSelectedItems.indexOf(item.value);
    if (selected && idx === -1) {
      nextSelectedItems.push(item.value);
    } else if (!selected && idx !== -1){
      nextSelectedItems.splice(idx, 1);
    }
    this.props.refine(nextSelectedItems);
  }

  render() {
    const {
      translations,
      theme,
      items,
      selectedItems,
    } = this.props;
    if (!items) {
      return null;
    }

    const th = themeable(theme);

    return (
      <div {...th('root', 'root')}>
        <ul {...th('list', 'list')}>
          {items.map(item =>
            <li
              {...th(
                item.value,
                'item',
                selectedItems.indexOf(item.value) !== -1 && 'itemSelected'
              )}
            >
              <RefinementListCheckboxItem
                translations={translations}
                theme={{
                  root: theme.itemContainer,
                  checkbox: theme.itemCheckbox,
                  label: theme.itemLabel,
                  count: theme.itemCount,
                }}
                selected={selectedItems.indexOf(item.value) !== -1}
                onChange={this.onItemChange}
                item={item}
              />
            </li>
          )}
        </ul>
      </div>
    );
  }
}

export default RefinementListLinks;
