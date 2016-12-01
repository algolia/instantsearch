import React, {PropTypes, Component} from 'react';

import translatable from '../core/translatable';
import classNames from './classNames.js';

const cx = classNames('ClearAll');

class ClearAll extends Component {
  static propTypes = {
    translate: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    refine: PropTypes.func.isRequired,
  };

  render() {
    const {translate, items, refine} = this.props;
    const isDisabled = items.length === 0;

    if (isDisabled) {
      return (
        <button {...cx('root')} disabled>
          {translate('reset')}
        </button>
      );
    }

    return (
      <button
        {...cx('root')}
        onClick={refine.bind(null, items)}
      >
        {translate('reset')}
      </button>
    );
  }
}

export default translatable({
  reset: 'ClearAll everything',
})(ClearAll);
