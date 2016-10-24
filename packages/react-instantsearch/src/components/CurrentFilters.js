import React, {PropTypes, Component} from 'react';

import themeable from '../core/themeable';
import translatable from '../core/translatable';

import theme from './CurrentFilters.css';

class CurrentFilters extends Component {
  static propTypes = {
    translate: PropTypes.func.isRequired,
    applyTheme: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
    })).isRequired,
    refine: PropTypes.func.isRequired,
  };

  render() {
    const {applyTheme, translate, items, refine} = this.props;

    if (items.length === 0) {
      return null;
    }

    return (
      <div {...applyTheme('root', 'root')}>
        <div {...applyTheme('items', 'items')}>
          {items.map(item =>
            <div // eslint-disable-line react/jsx-key, automatically done by themeable
              {...applyTheme(item.label, 'item')}
            >
              <span {...applyTheme('itemLabel', 'itemLabel')}>
                {item.label}
              </span>
              <button
                {...applyTheme('itemClear', 'itemClear')}
                onClick={refine.bind(null, [item])}
              >
                {translate('clearFilter', item)}
              </button>
            </div>
          )}
        </div>
        <button
          {...applyTheme('clearAll', 'clearAll')}
          onClick={refine.bind(null, items)}
        >
          {translate('clearAll')}
        </button>
      </div>
    );
  }
}

export default themeable(theme)(
  translatable({
    clearFilter: '✕',
    clearAll: 'Clear all',
  })(CurrentFilters)
);
