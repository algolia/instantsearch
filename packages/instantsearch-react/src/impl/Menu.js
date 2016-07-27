import React, {PropTypes, Component} from 'react';
import themeable from 'react-themeable';

import createFacetRefiner from '../createFacetRefiner';
import {itemsPropType, selectedItemsPropType} from '../propTypes';
import config from '../config';

import {getTranslation} from './utils';
import MenuLink from './MenuLink';

const defaultTranslations = {
  showMore: extended => extended ? 'Show less' : 'Show more',
};

const defaultTheme = {
  root: 'Menu',
  extended: 'Menu--extended',
  list: 'Menu__list',
  item: 'Menu__item',
  itemSelected: 'Menu__item--selected',
  itemLink: 'Menu__item__link',
  itemValue: 'Menu__item__value',
  itemCount: 'Menu__item__count',
  showMore: 'Menu__showMore',
};

class Menu extends Component {
  static propTypes = {
    refine: PropTypes.func.isRequired,
    items: itemsPropType,
    selectedItems: selectedItemsPropType,
    translations: PropTypes.object,
    theme: PropTypes.object,
    showMore: PropTypes.bool.isRequired,
    limitMin: PropTypes.number.isRequired,
    limitMax: PropTypes.number.isRequired,
  };

  static defaultProps = {
    translations: defaultTranslations,
    theme: defaultTheme,
  };

  constructor() {
    super();

    this.state = {
      extended: false,
    };
  }

  onItemClick = item => {
    this.props.refine(item.value);
  };

  onShowMoreClick = () => {
    this.setState(state => ({
      extended: !state.extended,
    }));
  };

  render() {
    const {
      translations,
      theme,
      items,
      selectedItems,
      showMore,
      limitMax,
      limitMin,
    } = this.props;
    const {extended} = this.state;
    if (!items) {
      return null;
    }

    const th = themeable(theme);

    return (
      <div {...th('root', 'root', extended && 'extended')}>
        <ul {...th('list', 'list')}>
          {items.slice(0, extended ? limitMax : limitMin).map(item =>
            <li
              {...th(
                item.value,
                'item',
                selectedItems.indexOf(item.value) !== -1 && 'itemSelected'
              )}
            >
              <MenuLink
                theme={{
                  root: theme.itemLink,
                  value: theme.itemValue,
                  count: theme.itemCount,
                }}
                onClick={this.onItemClick}
                createURL={createURL}
                item={item}
              />
            </li>
          )}
        </ul>
        {showMore &&
          <button
            onClick={this.onShowMoreClick}
            {...th('showMore', 'showMore')}
          >
            {getTranslation(
              'showMore',
              defaultTranslations,
              translations,
              extended
            )}
          </button>
        }
      </div>
    );
  }
}

export default Menu;
