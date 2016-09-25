import React, {PropTypes, Component} from 'react';

import themeable from '../../core/themeable';
import translatable from '../../core/translatable';

import theme from './CurrentFilters.css';

class CurrentFilters extends Component {
  static propTypes = {
    translate: PropTypes.func.isRequired,
    applyTheme: PropTypes.func.isRequired,
    filters: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.string,
    })).isRequired,
    refine: PropTypes.func.isRequired,
  };

  render() {
    const {applyTheme, translate, filters, refine} = this.props;
    const displayedFilters = filters.filter(filter => !filter.hide);
    if (displayedFilters.length === 0) {
      return null;
    }

    return (
      <div {...applyTheme('root', 'root')}>
        <div {...applyTheme('filters', 'filters')}>
          {displayedFilters.map(filter =>
            <div // eslint-disable-line react/jsx-key, automatically done by themeable
              {...applyTheme(filter.key, 'filter')}
            >
              <span {...applyTheme('filterLabel', 'filterLabel')}>
                {filter.label}
              </span>
              <button
                {...applyTheme('filterClear', 'filterClear')}
                onClick={refine.bind(null, [filter])}
              >
                {translate('clearFilter', filter)}
              </button>
            </div>
          )}
        </div>
        <button
          {...applyTheme('clearAll', 'clearAll')}
          onClick={refine.bind(null, displayedFilters)}
        >
          {translate('clearAll')}
        </button>
      </div>
    );
  }
}

export default themeable(theme)(
  translatable({
    clearFilter: '×',
    clearAll: 'Clear all',
  })(CurrentFilters)
);
