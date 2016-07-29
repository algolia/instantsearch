import React, {PropTypes, Component} from 'react';

import {itemsPropType, selectedItemsPropType} from '../propTypes';
import themeable from 'react-themeable';

import LinkItem from './LinkItem';
import {getTranslation} from '../utils';

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

  getSelectedItems = item => {
    const {selectedItems} = this.props;
    const nextSelectedItems = selectedItems.slice();
    const idx = nextSelectedItems.indexOf(item.value);
    if (idx === -1) {
      nextSelectedItems.push(item.value);
    } else {
      nextSelectedItems.splice(idx, 1);
    }
    return nextSelectedItems;
  };

  onItemClick = item => {
    this.props.refine(this.getSelectedItems(item));
  }

  render() {
    const {
      translations,
      theme,
      items,
      selectedItems,
      createURL,
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
              <LinkItem
                {...th('itemLink', 'itemLink')}
                onClick={this.onItemClick}
                item={item}
                href={createURL(this.getSelectedItems(item))}
              >
                <span {...th('itemLabel', 'itemLabel')}>
                  {item.value}
                </span>
                {' '}
                <span {...th('itemCount', 'itemCount')}>
                  {getTranslation(
                    'count',
                    defaultTranslations,
                    translations,
                    item.count
                  )}
                </span>
              </LinkItem>
            </li>
          )}
        </ul>
      </div>
    );
  }
}

export default RefinementListLinks;
