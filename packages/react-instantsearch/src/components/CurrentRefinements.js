import React, {PropTypes, Component} from 'react';

import translatable from '../core/translatable';
import classNames from './classNames.js';

const cx = classNames('CurrentRefinements');

class CurrentRefinements extends Component {
  static propTypes = {
    translate: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
    })).isRequired,
    refine: PropTypes.func.isRequired,
    canRefine: PropTypes.bool.isRequired,
    transformItems: PropTypes.func,
  };

  static contextTypes = {
    canRefine: PropTypes.func,
  };

  componentWillMount() {
    if (this.context.canRefine) this.context.canRefine(this.props.canRefine);
  }

  componentWillReceiveProps(props) {
    if (this.context.canRefine) this.context.canRefine(props.canRefine);
  }

  render() {
    const {translate, items, refine, canRefine} = this.props;

    return (
      <div {...cx('root', !canRefine && 'noRefinement')}>
        <div {...cx('items')}>
          {items.map(item =>
            <div
              key={item.label}
              {...cx('item', item.items && 'itemParent')}
            >
              <span {...cx('itemLabel')}>
                {item.label}
              </span>
              {item.items ?
                item.items.map(nestedItem =>
                  <div
                    key={nestedItem.label}
                    {...cx('item')}
                  >
                  <span {...cx('itemLabel')}>
                  {nestedItem.label}
                  </span>
                    <button
                      {...cx('itemClear')}
                      onClick={refine.bind(null, nestedItem.value)}
                    >
                      {translate('clearFilter', nestedItem)}
                    </button>
                  </div>) :
                <button
                  {...cx('itemClear')}
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

export default translatable({
  clearFilter: '✕',
})(CurrentRefinements);
