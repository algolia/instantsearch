import React, {PropTypes, Component} from 'react';

import themeable from '../core/themeable';
import translatable from '../core/translatable';

import theme from './CurrentRefinements.css';

class CurrentRefinements extends Component {
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
              {...applyTheme(item.label, 'item', item.items && 'itemParent')}
            >
              <span {...applyTheme('itemLabel', 'itemLabel')}>
                {item.label}
              </span>
              {item.items ?
                item.items.map(nestedItem =>
                  <div // eslint-disable-line react/jsx-key, automatically done by themeable
                    {...applyTheme(nestedItem.label, 'item')}
                  >
                  <span {...applyTheme('itemLabel', 'itemLabel')}>
                  {nestedItem.label}
                  </span>
                    <button
                      {...applyTheme('itemClear', 'itemClear')}
                      onClick={refine.bind(null, nestedItem.value)}
                    >
                      {translate('clearFilter', nestedItem)}
                    </button>
                  </div>) :
                <button
                  {...applyTheme('itemClear', 'itemClear')}
                  onClick={refine.bind(null, item.value)}
                >
                  {translate('clearFilter', item)}
                </button>}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default themeable(theme)(
  translatable({
    clearFilter: '✕',
  })(CurrentRefinements)
);
