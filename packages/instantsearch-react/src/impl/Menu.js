import React, {PropTypes, Component} from 'react';
import themeable from 'react-themeable';

import {itemsPropType, selectedItemsPropType} from '../propTypes';

import {getTranslation} from './utils';
import LinkItem from './LinkItem';

const defaultTranslations = {
  showMore: extended => extended ? 'Show less' : 'Show more',
  count: count => count.toString(),
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
    createURL: PropTypes.func.isRequired,
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

  onShowMoreClick = () => {
    this.setState(state => ({
      extended: !state.extended,
    }));
  };

  onItemClick = item => {
    this.props.refine(item.value);
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
      createURL,
    } = this.props;
    const {extended} = this.state;
    if (!items) {
      return null;
    }

    const th = themeable(theme);

    return (
      <div {...th('root', 'root')}>
        <ul {...th('list', 'list')}>
          {items
            .slice(0, !showMore || extended ? limitMax : limitMin)
            .map(item =>
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
                  href={createURL(item.value)}
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
            )
          }
        </ul>
        {showMore &&
          <button
            {...th('showMore', 'showMore')}
            onClick={this.onShowMoreClick}
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
